import { prisma } from "../../config/prisma.js";

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

  return prisma.patient.update({
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
};