import { prisma } from "../../config/prisma.js";
import { createAuditLog } from "../../utils/audit.js";

export const createPrescription = async (doctorUserId, data) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId: doctorUserId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: data.appointmentId,
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.doctorId !== doctor.id) {
    throw new Error(
      "You can only create prescriptions for your own appointments"
    );
  }

  if (appointment.status !== "COMPLETED") {
    throw new Error(
      "Prescription can only be created for a completed appointment"
    );
  }

  const existingPrescription = await prisma.prescription.findUnique({
    where: {
      appointmentId: appointment.id,
    },
  });

  if (existingPrescription) {
    throw new Error(
      "A prescription already exists for this appointment"
    );
  }

  return prisma.$transaction(async (tx) => {
    const prescription = await tx.prescription.create({
      data: {
        appointmentId: appointment.id,
        items: {
          create: data.items,
        },
      },
      include: {
        items: true,
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
    });

    await createAuditLog(tx, {
      userId: doctorUserId,
      action: "PRESCRIPTION_CREATED",
      entityType: "PRESCRIPTION",
      entityId: prescription.id,
      oldValue: null,
      newValue: {
        appointmentId: appointment.id,
        items: prescription.items.map((item) => ({
          id: item.id,
          medication: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
        })),
      },
    });

    return prescription;
  });
};

export const getPrescriptionById = async (userId, role, prescriptionId) => {
  const prescription = await prisma.prescription.findUnique({
    where: {
      id: prescriptionId,
    },
    include: {
      items: true,
      appointment: {
        include: {
          patient: true,
          doctor: true,
        },
      },
    },
  });

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId,
      },
    });

    if (!doctor || prescription.appointment.doctorId !== doctor.id) {
      throw new Error("Access denied");
    }
  }

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient || prescription.appointment.patientId !== patient.id) {
      throw new Error("Access denied");
    }
  }

  return prescription;
};

export const getMyPrescriptions = async (userId, role) => {
  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) {
      throw new Error("Patient profile not found");
    }

    return prisma.prescription.findMany({
      where: {
        appointment: {
          patientId: patient.id,
        },
      },
      include: {
        items: true,
        appointment: {
          include: {
            doctor: true,
          },
        },
      },
      orderBy: {
        appointment: {
          appointmentDate: "desc",
        },
      },
    });
  }

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId,
      },
    });

    if (!doctor) {
      throw new Error("Doctor profile not found");
    }

    return prisma.prescription.findMany({
      where: {
        appointment: {
          doctorId: doctor.id,
        },
      },
      include: {
        items: true,
        appointment: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: {
        appointment: {
          appointmentDate: "desc",
        },
      },
    });
  }

  throw new Error("Access denied");
};

export const updatePrescription = async (
  doctorUserId,
  prescriptionId,
  data
) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId: doctorUserId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const prescription = await prisma.prescription.findUnique({
    where: {
      id: prescriptionId,
    },
    include: {
      appointment: true,
      items: true,
    },
  });

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  if (prescription.appointment.doctorId !== doctor.id) {
    throw new Error(
      "You can only update prescriptions for your own appointments"
    );
  }

  if (prescription.appointment.status !== "COMPLETED") {
    throw new Error(
      "Prescription can only be updated for a completed appointment"
    );
  }

  const submittedItemIds = data.items
    .filter((item) => item.id)
    .map((item) => item.id);

  const existingItemIds = prescription.items.map((item) => item.id);

  const invalidItemIds = submittedItemIds.filter(
    (id) => !existingItemIds.includes(id)
  );

  if (invalidItemIds.length > 0) {
    throw new Error("Invalid prescription item");
  }

  const itemsToDelete = existingItemIds.filter(
    (id) => !submittedItemIds.includes(id)
  );

  return prisma.$transaction(async (tx) => {
    if (itemsToDelete.length > 0) {
      await tx.prescriptionItem.deleteMany({
        where: {
          id: {
            in: itemsToDelete,
          },
          prescriptionId,
        },
      });
    }

    for (const item of data.items) {
      if (item.id) {
        await tx.prescriptionItem.update({
          where: {
            id: item.id,
          },
          data: {
            medication: item.medication,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
          },
        });
      } else {
        await tx.prescriptionItem.create({
          data: {
            prescriptionId,
            medication: item.medication,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
          },
        });
      }
    }

    const updatedPrescription = await tx.prescription.findUnique({
      where: {
        id: prescriptionId,
      },
      include: {
        items: true,
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
    });

    await createAuditLog(tx, {
      userId: doctorUserId,
      action: "PRESCRIPTION_UPDATED",
      entityType: "PRESCRIPTION",
      entityId: prescriptionId,
      oldValue: {
        items: prescription.items.map((item) => ({
          id: item.id,
          medication: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
        })),
      },
      newValue: {
        items: updatedPrescription.items.map((item) => ({
          id: item.id,
          medication: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
        })),
      },
    });

    return updatedPrescription;
  });
};