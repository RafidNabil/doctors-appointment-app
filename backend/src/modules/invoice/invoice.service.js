import { prisma } from "../../config/prisma.js";
import { createAuditLog } from "../../utils/audit.js";

export const createInvoice = async (userId, data) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: data.appointmentId,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (
    appointment.status !== "CONFIRMED" &&
    appointment.status !== "COMPLETED"
  ) {
    throw new Error(
      "Invoice can only be created for confirmed or completed appointments"
    );
  }

  const existingInvoice = await prisma.invoice.findUnique({
    where: {
      appointmentId: appointment.id,
    },
  });

  if (existingInvoice) {
    throw new Error("An invoice already exists for this appointment");
  }

  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        appointmentId: appointment.id,
        amount: data.amount,
        total: data.total,
        status: "UNPAID",
      },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
        payments: true,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "INVOICE_CREATED",
      entityType: "INVOICE",
      entityId: invoice.id,
      oldValue: null,
      newValue: {
        appointmentId: invoice.appointmentId,
        amount: invoice.amount.toString(),
        total: invoice.total.toString(),
        status: invoice.status,
      },
    });

    return invoice;
  });
};

export const deleteInvoice = async (userId, invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.status === "PAID") {
    throw new Error("Paid invoices cannot be deleted");
  }

  if (invoice.payments.length > 0) {
    throw new Error(
      "Invoice with payment records cannot be deleted"
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.invoice.delete({
      where: {
        id: invoiceId,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "ADMIN_INVOICE_DELETED",
      entityType: "INVOICE",
      entityId: invoiceId,
      oldValue: {
        appointmentId: invoice.appointmentId,
        amount: invoice.amount.toString(),
        total: invoice.total.toString(),
        status: invoice.status,
      },
      newValue: null,
    });

    return {
      message: "Invoice deleted successfully",
    };
  });
};

export const getInvoiceById = async (userId, role, invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: true,
        },
      },
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient || invoice.appointment.patientId !== patient.id) {
      throw new Error("Access denied");
    }
  }

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId,
      },
    });

    if (!doctor || invoice.appointment.doctorId !== doctor.id) {
      throw new Error("Access denied");
    }
  }

  return invoice;
};

export const getMyInvoices = async (userId, role) => {
  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) {
      throw new Error("Patient profile not found");
    }

    return prisma.invoice.findMany({
      where: {
        appointment: {
          patientId: patient.id,
        },
      },
      include: {
        appointment: {
          include: {
            doctor: true,
          },
        },
        payments: true,
      },
      orderBy: {
        issuedAt: "desc",
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

    return prisma.invoice.findMany({
      where: {
        appointment: {
          doctorId: doctor.id,
        },
      },
      include: {
        appointment: {
          include: {
            patient: true,
          },
        },
        payments: true,
      },
      orderBy: {
        issuedAt: "desc",
      },
    });
  }

  if (role === "ADMIN") {
    return prisma.invoice.findMany({
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
        payments: true,
      },
      orderBy: {
        issuedAt: "desc",
      },
    });
  }

  throw new Error("Access denied");
};