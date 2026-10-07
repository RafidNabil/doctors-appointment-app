import { prisma } from "../../config/prisma.js";
import { createAuditLog } from "../../utils/audit.js";

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

export const updateDoctorStatus = async (
  userId,
  doctorId,
  isActive
) => {
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
        },
      },
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
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

    await createAuditLog(tx, {
      userId,
      action: "DOCTOR_STATUS_UPDATED",
      entityType: "DOCTOR",
      entityId: doctor.id,
      oldValue: {
        isActive: doctor.user.isActive,
      },
      newValue: {
        isActive: updatedUser.isActive,
      },
    });

    return updatedUser;
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

export const updatePatientStatus = async (
  userId,
  patientId,
  isActive
) => {
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
        },
      },
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
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

    await createAuditLog(tx, {
      userId,
      action: "PATIENT_STATUS_UPDATED",
      entityType: "PATIENT",
      entityId: patient.id,
      oldValue: {
        isActive: patient.user.isActive,
      },
      newValue: {
        isActive: updatedUser.isActive,
      },
    });

    return updatedUser;
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
  userId,
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

      const updatedAppointment = await tx.appointment.update({
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

      await createAuditLog(tx, {
        userId,
        action: `APPOINTMENT_${status}`,
        entityType: "APPOINTMENT",
        entityId: appointment.id,
        oldValue: {
          status: appointment.status,
          paymentStatus: appointment.paymentStatus,
          appointmentDate:
            appointment.appointmentDate.toISOString(),
          invoiceId: appointment.invoice?.id ?? null,
        },
        newValue: {
          status: updatedAppointment.status,
          paymentStatus: updatedAppointment.paymentStatus,
          appointmentDate:
            updatedAppointment.appointmentDate.toISOString(),
          invoiceId: null,
        },
      });

      return updatedAppointment;
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
      return prisma.$transaction(async (tx) => {
        const updatedAppointment =
          await tx.appointment.update({
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

        await createAuditLog(tx, {
          userId,
          action: "APPOINTMENT_CONFIRMED",
          entityType: "APPOINTMENT",
          entityId: appointment.id,
          oldValue: {
            status: appointment.status,
            paymentStatus: appointment.paymentStatus,
            appointmentDate:
              appointment.appointmentDate.toISOString(),
            invoiceId: null,
          },
          newValue: {
            status: "CONFIRMED",
            paymentStatus: updatedAppointment.paymentStatus,
            appointmentDate:
              updatedAppointment.appointmentDate.toISOString(),
            invoiceCreated: true,
          },
        });

        return getAppointmentById(appointment.id);
      });
    }
  }

  return prisma.$transaction(async (tx) => {
    const updatedAppointment = await tx.appointment.update({
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

    await createAuditLog(tx, {
      userId,
      action: `APPOINTMENT_${status}`,
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      oldValue: {
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        appointmentDate:
          appointment.appointmentDate.toISOString(),
      },
      newValue: {
        status: updatedAppointment.status,
        paymentStatus: updatedAppointment.paymentStatus,
        appointmentDate:
          updatedAppointment.appointmentDate.toISOString(),
      },
    });

    return updatedAppointment;
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
  userId,
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

  return prisma.$transaction(async (tx) => {
    const schedule = await tx.doctorSchedule.create({
      data: {
        doctorId,
        dayOfWeek: data.dayOfWeek,
        startTime,
        endTime,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "DOCTOR_SCHEDULE_CREATED",
      entityType: "DOCTOR_SCHEDULE",
      entityId: schedule.id,
      oldValue: null,
      newValue: {
        doctorId: schedule.doctorId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
      },
    });

    return schedule;
  });
};

export const updateDoctorSchedule = async (
  userId,
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

  return prisma.$transaction(async (tx) => {
    const updatedSchedule =
      await tx.doctorSchedule.update({
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

    await createAuditLog(tx, {
      userId,
      action: "DOCTOR_SCHEDULE_UPDATED",
      entityType: "DOCTOR_SCHEDULE",
      entityId: schedule.id,
      oldValue: {
        doctorId: schedule.doctorId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
      },
      newValue: {
        doctorId: updatedSchedule.doctorId,
        dayOfWeek: updatedSchedule.dayOfWeek,
        startTime: updatedSchedule.startTime.toISOString(),
        endTime: updatedSchedule.endTime.toISOString(),
      },
    });

    return updatedSchedule;
  });
};

export const deleteDoctorSchedule = async (
  userId,
  scheduleId
) => {
  const schedule = await prisma.doctorSchedule.findUnique({
    where: {
      id: scheduleId,
    },
  });

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.doctorSchedule.delete({
      where: {
        id: scheduleId,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "DOCTOR_SCHEDULE_DELETED",
      entityType: "DOCTOR_SCHEDULE",
      entityId: schedule.id,
      oldValue: {
        doctorId: schedule.doctorId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
      },
      newValue: null,
    });

    return {
      message: "Schedule deleted successfully",
    };
  });
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

export const createSetting = async (userId, data) => {
  const existing = await prisma.clinicSetting.findUnique({
    where: {
      key: data.key,
    },
  });

  if (existing) {
    throw new Error("Setting already exists");
  }

  return prisma.$transaction(async (tx) => {
    const setting = await tx.clinicSetting.create({
      data,
    });

    await createAuditLog(tx, {
      userId,
      action: "CLINIC_SETTING_CREATED",
      entityType: "CLINIC_SETTING",
      entityId: setting.id,
      oldValue: null,
      newValue: {
        key: setting.key,
        value: setting.value,
      },
    });

    return setting;
  });
};

export const updateSetting = async (
  userId,
  settingId,
  value
) => {
  const setting = await prisma.clinicSetting.findUnique({
    where: {
      id: settingId,
    },
  });

  if (!setting) {
    throw new Error("Setting not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedSetting =
      await tx.clinicSetting.update({
        where: {
          id: settingId,
        },
        data: {
          value,
        },
      });

    await createAuditLog(tx, {
      userId,
      action: "CLINIC_SETTING_UPDATED",
      entityType: "CLINIC_SETTING",
      entityId: setting.id,
      oldValue: {
        key: setting.key,
        value: setting.value,
      },
      newValue: {
        key: updatedSetting.key,
        value: updatedSetting.value,
      },
    });

    return updatedSetting;
  });
};

export const deleteSetting = async (
  userId,
  settingId
) => {
  const setting = await prisma.clinicSetting.findUnique({
    where: {
      id: settingId,
    },
  });

  if (!setting) {
    throw new Error("Setting not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.clinicSetting.delete({
      where: {
        id: settingId,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "CLINIC_SETTING_DELETED",
      entityType: "CLINIC_SETTING",
      entityId: setting.id,
      oldValue: {
        key: setting.key,
        value: setting.value,
      },
      newValue: null,
    });

    return {
      message: "Setting deleted successfully",
    };
  });
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

export const createBookingRule = async (
  userId,
  data
) => {
  const existing = await prisma.bookingRule.findUnique({
    where: {
      key: data.key,
    },
  });

  if (existing) {
    throw new Error("Booking rule already exists");
  }

  return prisma.$transaction(async (tx) => {
    const rule = await tx.bookingRule.create({
      data,
    });

    await createAuditLog(tx, {
      userId,
      action: "BOOKING_RULE_CREATED",
      entityType: "BOOKING_RULE",
      entityId: rule.id,
      oldValue: null,
      newValue: {
        key: rule.key,
        value: rule.value,
      },
    });

    return rule;
  });
};

export const updateBookingRule = async (
  userId,
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

  return prisma.$transaction(async (tx) => {
    const updatedRule =
      await tx.bookingRule.update({
        where: {
          id: ruleId,
        },
        data: {
          value,
        },
      });

    await createAuditLog(tx, {
      userId,
      action: "BOOKING_RULE_UPDATED",
      entityType: "BOOKING_RULE",
      entityId: rule.id,
      oldValue: {
        key: rule.key,
        value: rule.value,
      },
      newValue: {
        key: updatedRule.key,
        value: updatedRule.value,
      },
    });

    return updatedRule;
  });
};

export const deleteBookingRule = async (
  userId,
  ruleId
) => {
  const rule = await prisma.bookingRule.findUnique({
    where: {
      id: ruleId,
    },
  });

  if (!rule) {
    throw new Error("Booking rule not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.bookingRule.delete({
      where: {
        id: ruleId,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "BOOKING_RULE_DELETED",
      entityType: "BOOKING_RULE",
      entityId: rule.id,
      oldValue: {
        key: rule.key,
        value: rule.value,
      },
      newValue: null,
    });

    return {
      message: "Booking rule deleted successfully",
    };
  });
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

export const createRole = async (userId, data) => {
  return prisma.$transaction(async (tx) => {
    const role = await tx.role.create({
      data: {
        name: data.name,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "ROLE_CREATED",
      entityType: "ROLE",
      entityId: role.id,
      oldValue: null,
      newValue: {
        name: role.name,
      },
    });

    return role;
  });
};

export const updateRole = async (
  userId,
  roleId,
  name
) => {
  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedRole = await tx.role.update({
      where: {
        id: roleId,
      },
      data: {
        name,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "ROLE_UPDATED",
      entityType: "ROLE",
      entityId: role.id,
      oldValue: {
        name: role.name,
      },
      newValue: {
        name: updatedRole.name,
      },
    });

    return updatedRole;
  });
};

export const deleteRole = async (
  userId,
  roleId
) => {
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

  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: {
        roleId,
      },
    });

    await tx.role.delete({
      where: {
        id: roleId,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "ROLE_DELETED",
      entityType: "ROLE",
      entityId: role.id,
      oldValue: {
        name: role.name,
        permissionIds: role.permissions.map(
          (permission) => permission.permissionId
        ),
      },
      newValue: null,
    });

    return {
      message: "Role deleted successfully",
    };
  });
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

export const createPermission = async (
  userId,
  data
) => {
  return prisma.$transaction(async (tx) => {
    const permission = await tx.permission.create({
      data: {
        name: data.name,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "PERMISSION_CREATED",
      entityType: "PERMISSION",
      entityId: permission.id,
      oldValue: null,
      newValue: {
        name: permission.name,
      },
    });

    return permission;
  });
};

export const updatePermission = async (
  userId,
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

  return prisma.$transaction(async (tx) => {
    const updatedPermission =
      await tx.permission.update({
        where: {
          id: permissionId,
        },
        data: {
          name,
        },
      });

    await createAuditLog(tx, {
      userId,
      action: "PERMISSION_UPDATED",
      entityType: "PERMISSION",
      entityId: permission.id,
      oldValue: {
        name: permission.name,
      },
      newValue: {
        name: updatedPermission.name,
      },
    });

    return updatedPermission;
  });
};

export const deletePermission = async (
  userId,
  permissionId
) => {
  const permission = await prisma.permission.findUnique({
    where: {
      id: permissionId,
    },
  });

  if (!permission) {
    throw new Error("Permission not found");
  }

  const rolePermissions =
    await prisma.rolePermission.findMany({
      where: {
        permissionId,
      },
      select: {
        roleId: true,
      },
    });

  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: {
        permissionId,
      },
    });

    await tx.permission.delete({
      where: {
        id: permissionId,
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "PERMISSION_DELETED",
      entityType: "PERMISSION",
      entityId: permission.id,
      oldValue: {
        name: permission.name,
        roleIds: rolePermissions.map(
          (rolePermission) => rolePermission.roleId
        ),
      },
      newValue: null,
    });

    return {
      message: "Permission deleted successfully",
    };
  });
};

export const assignPermissionToRole = async (
  userId,
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

  return prisma.$transaction(async (tx) => {
    const rolePermission =
      await tx.rolePermission.create({
        data: {
          roleId,
          permissionId,
        },
        include: {
          role: true,
          permission: true,
        },
      });

    await createAuditLog(tx, {
      userId,
      action: "PERMISSION_ASSIGNED_TO_ROLE",
      entityType: "ROLE_PERMISSION",
      entityId: rolePermission.roleId,
      oldValue: null,
      newValue: {
        roleId: rolePermission.roleId,
        permissionId: rolePermission.permissionId,
        roleName: role.name,
        permissionName: permission.name,
      },
    });

    return rolePermission;
  });
};

export const removePermissionFromRole = async (
  userId,
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
    include: {
      role: true,
      permission: true,
    },
  });

  if (!existing) {
    throw new Error("Permission is not assigned to role");
  }

  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    await createAuditLog(tx, {
      userId,
      action: "PERMISSION_REMOVED_FROM_ROLE",
      entityType: "ROLE_PERMISSION",
      entityId: existing.roleId,
      oldValue: {
        roleId: existing.roleId,
        permissionId: existing.permissionId,
        roleName: existing.role.name,
        permissionName: existing.permission.name,
      },
      newValue: null,
    });

    return {
      message: "Permission removed from role",
    };
  });
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