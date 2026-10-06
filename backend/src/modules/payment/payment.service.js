import { prisma } from "../../config/prisma.js";

export const createPayment = async (userId, role, data) => {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: data.invoiceId,
    },
    include: {
      appointment: true,
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.status === "PAID") {
    throw new Error("Invoice is already paid");
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

    if (invoice.appointment.doctorId !== doctor.id) {
      throw new Error("Access denied");
    }
  }

  const invoiceTotal = Number(invoice.total);

  if (data.amount !== invoiceTotal) {
    throw new Error("Payment amount must match the invoice total");
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: data.amount,
        method: "CASH",
        status: "COMPLETED",
        paidAt: new Date(),
      },
    });

    await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: "PAID",
      },
    });

    await tx.appointment.update({
      where: {
        id: invoice.appointmentId,
      },
      data: {
        paymentStatus: "PAID",
      },
    });

    return tx.payment.findUnique({
      where: {
        id: payment.id,
      },
      include: {
        invoice: {
          include: {
            appointment: {
              include: {
                patient: true,
                doctor: true,
              },
            },
          },
        },
      },
    });
  });
};

export const getPaymentById = async (userId, role, paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      invoice: {
        include: {
          appointment: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient || payment.invoice.appointment.patientId !== patient.id) {
      throw new Error("Access denied");
    }
  }

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: {
        userId,
      },
    });

    if (!doctor || payment.invoice.appointment.doctorId !== doctor.id) {
      throw new Error("Access denied");
    }
  }

  return payment;
};

export const getMyPayments = async (userId, role) => {
  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) {
      throw new Error("Patient profile not found");
    }

    return prisma.payment.findMany({
      where: {
        invoice: {
          appointment: {
            patientId: patient.id,
          },
        },
      },
      include: {
        invoice: {
          include: {
            appointment: {
              include: {
                doctor: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: "desc",
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

    return prisma.payment.findMany({
      where: {
        invoice: {
          appointment: {
            doctorId: doctor.id,
          },
        },
      },
      include: {
        invoice: {
          include: {
            appointment: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
    });
  }

  if (role === "ADMIN") {
    return prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            appointment: {
              include: {
                patient: true,
                doctor: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
    });
  }

  throw new Error("Access denied");
};