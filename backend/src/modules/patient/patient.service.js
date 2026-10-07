import { prisma } from "../../config/prisma.js";
import { createAuditLog } from "../../utils/audit.js";

export const getMyProfile = async (userId) => {
  const patient = await prisma.patient.findUnique({
    where: {
      userId,
    },

    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
    },
  });

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  return patient;
};

export const updateMyProfile = async (userId, data) => {
  const patient = await prisma.patient.findUnique({
    where: {
      userId,
    },
  });

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedPatient = await tx.patient.update({
      where: {
        userId,
      },

      data: {
        ...(data.firstName !== undefined && {
          firstName: data.firstName,
        }),
        ...(data.lastName !== undefined && {
          lastName: data.lastName,
        }),
        ...(data.phone !== undefined && {
          phone: data.phone,
        }),
        ...(data.dateOfBirth !== undefined && {
          dateOfBirth: data.dateOfBirth,
        }),
        ...(data.gender !== undefined && {
          gender: data.gender,
        }),
      },

      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "PATIENT_PROFILE_UPDATED",
      entityType: "PATIENT",
      entityId: patient.id,
      oldValue: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth?.toISOString() ?? null,
        gender: patient.gender,
      },
      newValue: {
        firstName: updatedPatient.firstName,
        lastName: updatedPatient.lastName,
        phone: updatedPatient.phone,
        dateOfBirth: updatedPatient.dateOfBirth?.toISOString() ?? null,
        gender: updatedPatient.gender,
      },
    });

    return updatedPatient;
  });
};