import { prisma } from "../../config/prisma.js";
import { createAuditLog } from "../../utils/audit.js";

export const getDoctors = async ({ search, specialization }) => {
  return prisma.doctor.findMany({
    where: {
      user: {
        isActive: true,
      },

      ...(search && {
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            specialization: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),

      ...(specialization && {
        specialization: {
          equals: specialization,
          mode: "insensitive",
        },
      }),
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      specialization: true,
      qualification: true,
      experience: true,
      bio: true,
      consultationFee: true,
    },

    orderBy: {
      firstName: "asc",
    },
  });
};

export const getDoctorById = async (doctorId) => {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id: doctorId,
      user: {
        isActive: true,
      },
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      specialization: true,
      qualification: true,
      experience: true,
      bio: true,
      consultationFee: true,
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return doctor;
};

export const getMyProfile = async (userId) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },

    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      phone: true,
      specialization: true,
      qualification: true,
      experience: true,
      bio: true,
      consultationFee: true,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return doctor;
};

export const updateMyProfile = async (userId, data) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedDoctor = await tx.doctor.update({
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
        ...(data.specialization !== undefined && {
          specialization: data.specialization,
        }),
        ...(data.qualification !== undefined && {
          qualification: data.qualification,
        }),
        ...(data.experience !== undefined && {
          experience: data.experience,
        }),
        ...(data.bio !== undefined && {
          bio: data.bio,
        }),
        ...(data.consultationFee !== undefined && {
          consultationFee: data.consultationFee,
        }),
      },

      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialization: true,
        qualification: true,
        experience: true,
        bio: true,
        consultationFee: true,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "DOCTOR_PROFILE_UPDATED",
      entityType: "DOCTOR",
      entityId: doctor.id,
      oldValue: {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        phone: doctor.phone,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        bio: doctor.bio,
        consultationFee: doctor.consultationFee.toString(),
      },
      newValue: {
        firstName: updatedDoctor.firstName,
        lastName: updatedDoctor.lastName,
        phone: updatedDoctor.phone,
        specialization: updatedDoctor.specialization,
        qualification: updatedDoctor.qualification,
        experience: updatedDoctor.experience,
        bio: updatedDoctor.bio,
        consultationFee: updatedDoctor.consultationFee.toString(),
      },
    });

    return updatedDoctor;
  });
};