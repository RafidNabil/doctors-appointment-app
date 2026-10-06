import { prisma } from "../../config/prisma.js";

const getDayOfWeek = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  return date.getUTCDay();
};

const startOfToday = () => {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
  );
};

const getAppointmentStatusFilter = (statuses) => ({
  status: {
    in: statuses,
  },
});

export const getAvailableSlots = async (doctorId, date) => {
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
      specialization: true,
      schedules: {
        where: {
          dayOfWeek: getDayOfWeek(date),
        },
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return {
    doctor: {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
    },
    date,
    schedules: doctor.schedules,
  };
};

export const bookAppointment = async (patientUserId, data) => {
  const patient = await prisma.patient.findUnique({
    where: {
      userId: patientUserId,
    },
  });

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  const doctor = await prisma.doctor.findFirst({
    where: {
      id: data.doctorId,
      user: {
        isActive: true,
      },
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const appointmentDate = new Date(
    `${data.appointmentDate}T00:00:00.000Z`
  );

  if (appointmentDate < startOfToday()) {
    throw new Error("Appointment date cannot be in the past");
  }

  const dayOfWeek = getDayOfWeek(data.appointmentDate);

  const schedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId: doctor.id,
      dayOfWeek,
    },
  });

  if (!schedule) {
    throw new Error(
      "Doctor is not available on the selected date"
    );
  }

  const existingAppointment =
    await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate,
        status: {
          in: ["CONFIRMED"],
        },
      },
    });

  if (existingAppointment) {
    throw new Error(
      "You already have an appointment with this doctor on this date"
    );
  }

  return prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentDate,
      status: "CONFIRMED",
      paymentStatus: "PENDING",
    },
    include: {
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialization: true,
          consultationFee: true,
        },
      },
    },
  });
};

export const getUpcomingAppointments = async (
  userId,
  role
) => {
  const today = startOfToday();

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) {
      throw new Error("Patient profile not found");
    }

    return prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        appointmentDate: {
          gte: today,
        },
        ...getAppointmentStatusFilter(["CONFIRMED"]),
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            consultationFee: true,
          },
        },
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });
  }

  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      appointmentDate: {
        gte: today,
      },
      ...getAppointmentStatusFilter(["CONFIRMED"]),
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
        },
      },
    },
    orderBy: {
      appointmentDate: "asc",
    },
  });
};

export const getAppointmentHistory = async (
  userId,
  role
) => {
  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) {
      throw new Error("Patient profile not found");
    }

    return prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        status: {
          in: ["COMPLETED", "NO_SHOW", "CANCELLED"],
        },
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        appointmentDate: "desc",
      },
    });
  }

  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      status: {
        in: ["COMPLETED", "NO_SHOW", "CANCELLED"],
      },
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
        },
      },
    },
    orderBy: {
      appointmentDate: "desc",
    },
  });
};

export const cancelAppointment = async (
  userId,
  appointmentId
) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorId: doctor.id,
      status: "CONFIRMED",
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return prisma.appointment.update({
    where: {
      id: appointment.id,
    },
    data: {
      status: "CANCELLED",
    },
  });
};

export const rescheduleAppointment = async (
  userId,
  appointmentId,
  newDate
) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorId: doctor.id,
      status: "CONFIRMED",
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const newAppointmentDate = new Date(
    `${newDate}T00:00:00.000Z`
  );

  if (newAppointmentDate < startOfToday()) {
    throw new Error("Appointment date cannot be in the past");
  }

  const dayOfWeek = getDayOfWeek(newDate);

  const schedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId: doctor.id,
      dayOfWeek,
    },
  });

  if (!schedule) {
    throw new Error(
      "Doctor is not available on the selected date"
    );
  }

  return prisma.appointment.update({
    where: {
      id: appointment.id,
    },
    data: {
      appointmentDate: newAppointmentDate,
    },
  });
};

export const completeAppointment = async (
  userId,
  appointmentId
) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorId: doctor.id,
      status: "CONFIRMED",
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return prisma.appointment.update({
    where: {
      id: appointment.id,
    },
    data: {
      status: "COMPLETED",
    },
  });
};

export const markNoShow = async (
  userId,
  appointmentId
) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorId: doctor.id,
      status: "CONFIRMED",
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return prisma.appointment.update({
    where: {
      id: appointment.id,
    },
    data: {
      status: "NO_SHOW",
    },
  });
};

export const getAppointmentPatient = async (
  userId,
  appointmentId
) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorId: doctor.id,
    },
    select: {
      id: true,
      appointmentDate: true,
      status: true,
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return appointment;
};