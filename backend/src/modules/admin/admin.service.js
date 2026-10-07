import { prisma } from "../../config/prisma.js";

const timeToDate = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(1970, 0, 1);
  date.setHours(hours, minutes, 0, 0);

  return date;
};

const validateTimeRange = (startTime, endTime) => {
  const start = timeToDate(startTime);
  const end = timeToDate(endTime);

  if (start >= end) {
    throw new Error("Start time must be before end time");
  }

  return {
    startTime: start,
    endTime: end,
  };
};

/* =========================
   DOCTORS
========================= */

export const getDoctors = async () => {
  return prisma.doctor.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
      schedules: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });
};

export const getDoctorById = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: doctorId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
      schedules: true,
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return doctor;
};

export const updateDoctorStatus = async (doctorId, isActive) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: doctorId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return prisma.user.update({
    where: {
      id: doctor.userId,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
};

/* =========================
   PATIENTS
========================= */

export const getPatients = async () => {
  return prisma.patient.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      firstName: "asc",
    },
  });
};

export const getPatientById = async (patientId) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
};

export const updatePatientStatus = async (patientId, isActive) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return prisma.user.update({
    where: {
      id: patient.userId,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
};

/* =========================
   APPOINTMENTS
========================= */

export const getAppointments = async () => {
  return prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: true,
      invoice: {
        include: {
          payments: true,
        },
      },
      prescription: {
        include: {
          items: true,
        },
      },
    },
    orderBy: [
      {
        appointmentDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
};

export const getAppointmentById = async (appointmentId) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },
    include: {
      patient: true,
      doctor: true,
      invoice: {
        include: {
          payments: true,
        },
      },
      prescription: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return appointment;
};

export const updateAppointmentStatus = async (
  appointmentId,
  status
) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },
    include: {
      invoice: {
        include: {
          payments: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (
    status === "CANCELLED" ||
    status === "NO_SHOW"
  ) {
    if (appointment.invoice?.payments.length > 0) {
      throw new Error(
        "Appointment cannot be cancelled or marked as no-show because the invoice has payment records"
      );
    }

    return prisma.$transaction(async (tx) => {
      if (appointment.invoice) {
        await tx.invoice.delete({
          where: {
            id: appointment.invoice.id,
          },
        });
      }

      return tx.appointment.update({
        where: {
          id: appointment.id,
        },
        data: {
          status,
        },
        include: {
          patient: true,
          doctor: true,
        },
      });
    });
  }

  if (status === "COMPLETED") {
    if (appointment.status !== "CONFIRMED") {
      throw new Error(
        "Only confirmed appointments can be completed"
      );
    }
  }

  if (status === "CONFIRMED") {
    if (appointment.status !== "CANCELLED") {
      throw new Error(
        "Only cancelled appointments can be confirmed again"
      );
    }

    if (!appointment.invoice) {
      await prisma.$transaction(async (tx) => {
        const updatedAppointment = await tx.appointment.update({
          where: {
            id: appointment.id,
          },
          data: {
            status: "CONFIRMED",
          },
        });

        const doctor = await tx.doctor.findUnique({
          where: {
            id: appointment.doctorId,
          },
        });

        await tx.invoice.create({
          data: {
            appointmentId: updatedAppointment.id,
            amount: doctor.consultationFee,
            total: doctor.consultationFee,
            status: "UNPAID",
          },
        });
      });

      return getAppointmentById(appointment.id);
    }
  }

  return prisma.appointment.update({
    where: {
      id: appointment.id,
    },
    data: {
      status,
    },
    include: {
      patient: true,
      doctor: true,
    },
  });
};

/* =========================
   SCHEDULES
========================= */

export const getDoctorSchedules = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: doctorId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return prisma.doctorSchedule.findMany({
    where: {
      doctorId,
    },
    orderBy: {
      dayOfWeek: "asc",
    },
  });
};

export const createDoctorSchedule = async (
  doctorId,
  data
) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: doctorId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const { startTime, endTime } = validateTimeRange(
    data.startTime,
    data.endTime
  );

  return prisma.doctorSchedule.create({
    data: {
      doctorId,
      dayOfWeek: data.dayOfWeek,
      startTime,
      endTime,
    },
  });
};

export const updateDoctorSchedule = async (
  scheduleId,
  data
) => {
  const schedule = await prisma.doctorSchedule.findUnique({
    where: {
      id: scheduleId,
    },
  });

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  let startTime;
  let endTime;

  if (data.startTime || data.endTime) {
    const currentStart = data.startTime ?? schedule.startTime;
    const currentEnd = data.endTime ?? schedule.endTime;

    const startString = currentStart
      .toISOString()
      .substring(11, 16);

    const endString = currentEnd
      .toISOString()
      .substring(11, 16);

    const result = validateTimeRange(
      data.startTime ?? startString,
      data.endTime ?? endString
    );

    startTime = result.startTime;
    endTime = result.endTime;
  }

  return prisma.doctorSchedule.update({
    where: {
      id: scheduleId,
    },
    data: {
      ...(data.dayOfWeek !== undefined && {
        dayOfWeek: data.dayOfWeek,
      }),
      ...(startTime && {
        startTime,
      }),
      ...(endTime && {
        endTime,
      }),
    },
  });
};

export const deleteDoctorSchedule = async (scheduleId) => {
  const schedule = await prisma.doctorSchedule.findUnique({
    where: {
      id: scheduleId,
    },
  });

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  await prisma.doctorSchedule.delete({
    where: {
      id: scheduleId,
    },
  });

  return {
    message: "Schedule deleted successfully",
  };
};

/* =========================
   REPORTS
========================= */

export const getOverviewReport = async () => {
  const [
    totalDoctors,
    totalPatients,
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    paidInvoices,
    revenue,
  ] = await Promise.all([
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.appointment.count({
      where: {
        status: "CANCELLED",
      },
    }),
    prisma.appointment.count({
      where: {
        status: "NO_SHOW",
      },
    }),
    prisma.invoice.count({
      where: {
        status: "PAID",
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    totalDoctors,
    totalPatients,
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    paidInvoices,
    totalRevenue: revenue._sum.amount ?? 0,
  };
};

export const getAppointmentReport = async () => {
  const [
    confirmed,
    completed,
    cancelled,
    noShow,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        status: "CONFIRMED",
      },
    }),
    prisma.appointment.count({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.appointment.count({
      where: {
        status: "CANCELLED",
      },
    }),
    prisma.appointment.count({
      where: {
        status: "NO_SHOW",
      },
    }),
  ]);

  return {
    confirmed,
    completed,
    cancelled,
    noShow,
  };
};

export const getRevenueReport = async () => {
  const [paid, unpaid] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        status: "PAID",
      },
      _sum: {
        total: true,
      },
    }),
    prisma.invoice.aggregate({
      where: {
        status: "UNPAID",
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  return {
    paid: paid._sum.total ?? 0,
    unpaid: unpaid._sum.total ?? 0,
  };
};

/* =========================
   CLINIC SETTINGS
========================= */

export const getSettings = async () => {
  return prisma.clinicSetting.findMany({
    orderBy: {
      key: "asc",
    },
  });
};

export const createSetting = async (data) => {
  const existing = await prisma.clinicSetting.findUnique({
    where: {
      key: data.key,
    },
  });

  if (existing) {
    throw new Error("Setting already exists");
  }

  return prisma.clinicSetting.create({
    data,
  });
};

export const updateSetting = async (settingId, value) => {
  const setting = await prisma.clinicSetting.findUnique({
    where: {
      id: settingId,
    },
  });

  if (!setting) {
    throw new Error("Setting not found");
  }

  return prisma.clinicSetting.update({
    where: {
      id: settingId,
    },
    data: {
      value,
    },
  });
};

export const deleteSetting = async (settingId) => {
  const setting = await prisma.clinicSetting.findUnique({
    where: {
      id: settingId,
    },
  });

  if (!setting) {
    throw new Error("Setting not found");
  }

  await prisma.clinicSetting.delete({
    where: {
      id: settingId,
    },
  });

  return {
    message: "Setting deleted successfully",
  };
};

/* =========================
   BOOKING RULES
========================= */

export const getBookingRules = async () => {
  return prisma.bookingRule.findMany({
    orderBy: {
      key: "asc",
    },
  });
};

export const createBookingRule = async (data) => {
  const existing = await prisma.bookingRule.findUnique({
    where: {
      key: data.key,
    },
  });

  if (existing) {
    throw new Error("Booking rule already exists");
  }

  return prisma.bookingRule.create({
    data,
  });
};

export const updateBookingRule = async (
  ruleId,
  value
) => {
  const rule = await prisma.bookingRule.findUnique({
    where: {
      id: ruleId,
    },
  });

  if (!rule) {
    throw new Error("Booking rule not found");
  }

  return prisma.bookingRule.update({
    where: {
      id: ruleId,
    },
    data: {
      value,
    },
  });
};

export const deleteBookingRule = async (ruleId) => {
  const rule = await prisma.bookingRule.findUnique({
    where: {
      id: ruleId,
    },
  });

  if (!rule) {
    throw new Error("Booking rule not found");
  }

  await prisma.bookingRule.delete({
    where: {
      id: ruleId,
    },
  });

  return {
    message: "Booking rule deleted successfully",
  };
};

/* =========================
   ROLES
========================= */

export const getRoles = async () => {
  return prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const createRole = async (data) => {
  return prisma.role.create({
    data: {
      name: data.name,
    },
  });
};

export const updateRole = async (roleId, name) => {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  return prisma.role.update({
    where: {
      id: roleId,
    },
    data: {
      name,
    },
  });
};

export const deleteRole = async (roleId) => {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
    include: {
      permissions: true,
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
    },
  });

  await prisma.role.delete({
    where: {
      id: roleId,
    },
  });

  return {
    message: "Role deleted successfully",
  };
};

/* =========================
   PERMISSIONS
========================= */

export const getPermissions = async () => {
  return prisma.permission.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const createPermission = async (data) => {
  return prisma.permission.create({
    data: {
      name: data.name,
    },
  });
};

export const updatePermission = async (
  permissionId,
  name
) => {
  const permission = await prisma.permission.findUnique({
    where: {
      id: permissionId,
    },
  });

  if (!permission) {
    throw new Error("Permission not found");
  }

  return prisma.permission.update({
    where: {
      id: permissionId,
    },
    data: {
      name,
    },
  });
};

export const deletePermission = async (permissionId) => {
  const permission = await prisma.permission.findUnique({
    where: {
      id: permissionId,
    },
  });

  if (!permission) {
    throw new Error("Permission not found");
  }

  await prisma.rolePermission.deleteMany({
    where: {
      permissionId,
    },
  });

  await prisma.permission.delete({
    where: {
      id: permissionId,
    },
  });

  return {
    message: "Permission deleted successfully",
  };
};

export const assignPermissionToRole = async (
  roleId,
  permissionId
) => {
  const [role, permission] = await Promise.all([
    prisma.role.findUnique({
      where: {
        id: roleId,
      },
    }),
    prisma.permission.findUnique({
      where: {
        id: permissionId,
      },
    }),
  ]);

  if (!role) {
    throw new Error("Role not found");
  }

  if (!permission) {
    throw new Error("Permission not found");
  }

  const existing = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
  });

  if (existing) {
    throw new Error("Permission already assigned to role");
  }

  return prisma.rolePermission.create({
    data: {
      roleId,
      permissionId,
    },
    include: {
      role: true,
      permission: true,
    },
  });
};

export const removePermissionFromRole = async (
  roleId,
  permissionId
) => {
  const existing = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
  });

  if (!existing) {
    throw new Error("Permission is not assigned to role");
  }

  await prisma.rolePermission.delete({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
  });

  return {
    message: "Permission removed from role",
  };
};

/* =========================
   AUDIT LOGS
========================= */

export const getAuditLogs = async (filters) => {
  return prisma.auditLog.findMany({
    where: {
      ...(filters.entityType && {
        entityType: filters.entityType,
      }),
      ...(filters.entityId && {
        entityId: filters.entityId,
      }),
      ...(filters.userId && {
        userId: filters.userId,
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAuditLogById = async (auditLogId) => {
  const auditLog = await prisma.auditLog.findUnique({
    where: {
      id: auditLogId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!auditLog) {
    throw new Error("Audit log not found");
  }

  return auditLog;
};