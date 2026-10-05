import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const SALT_ROUNDS = 12;

const main = async () => {
  const doctorRole = await prisma.role.upsert({
    where: {
      name: "DOCTOR",
    },
    update: {},
    create: {
      name: "DOCTOR",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
    },
  });

  const patientRole = await prisma.role.upsert({
    where: {
      name: "PATIENT",
    },
    update: {},
    create: {
      name: "PATIENT",
    },
  });

  const doctorPasswordHash = await bcrypt.hash(
    "Doctor123!",
    SALT_ROUNDS
  );

  const adminPasswordHash = await bcrypt.hash(
    "Admin123!",
    SALT_ROUNDS
  );

  const doctor = await prisma.user.upsert({
    where: {
      email: "doctor@clinic.com",
    },
    update: {},
    create: {
      email: "doctor@clinic.com",
      passwordHash: doctorPasswordHash,
      role: "DOCTOR",
      isActive: true,

      doctor: {
        create: {
          firstName: "John",
          lastName: "Smith",
          phone: "01700000001",
          specialization: "Cardiology",
          qualification: "MBBS, FCPS",
          experience: "10 years",
          bio: "Experienced cardiologist.",
          consultationFee: 1000,
        },
      },
    },
    include: {
      doctor: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@clinic.com",
    },
    update: {},
    create: {
      email: "admin@clinic.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Seed completed.");
  console.log("Roles:", {
    doctorRole: doctorRole.name,
    adminRole: adminRole.name,
    patientRole: patientRole.name,
  });

  console.log("Doctor:", doctor.email);
  console.log("Admin:", admin.email);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });