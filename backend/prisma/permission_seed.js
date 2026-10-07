import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const rolePermissions = {
  ADMIN: [
    "MANAGE_DOCTORS",
    "MANAGE_PATIENTS",
    "MANAGE_APPOINTMENTS",
    "MANAGE_SCHEDULES",
    "MANAGE_PAYMENTS",
    "MANAGE_INVOICES",
    "VIEW_REPORTS",
    "MANAGE_CLINIC_SETTINGS",
    "MANAGE_BOOKING_RULES",
    "MANAGE_ROLES",
    "MANAGE_PERMISSIONS",
    "VIEW_AUDIT_LOGS",
  ],

  DOCTOR: [
    "MANAGE_DOCTOR_PROFILE",
    "MANAGE_DOCTOR_SCHEDULE",
    "VIEW_DOCTOR_APPOINTMENTS",
    "MANAGE_DOCTOR_APPOINTMENTS",
    "VIEW_PATIENT_INFORMATION",
    "MANAGE_PRESCRIPTIONS",
    "RECORD_PAYMENTS",
    "VIEW_DOCTOR_INVOICES",
    "VIEW_DOCTOR_PAYMENTS",
  ],

  PATIENT: [
    "MANAGE_PATIENT_PROFILE",
    "VIEW_DOCTORS",
    "VIEW_DOCTOR_SCHEDULES",
    "BOOK_APPOINTMENTS",
    "VIEW_PATIENT_APPOINTMENTS",
    "VIEW_PATIENT_INVOICES",
    "VIEW_PATIENT_PAYMENTS",
    "VIEW_PATIENT_PRESCRIPTIONS",
  ],
};

async function main() {
  const permissionNames = [
    ...new Set(Object.values(rolePermissions).flat()),
  ];

  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });
  }

  for (const [roleName, permissions] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({
      where: {
        name: roleName,
      },
      update: {},
      create: {
        name: roleName,
      },
    });

    for (const permissionName of permissions) {
      const permission = await prisma.permission.findUnique({
        where: {
          name: permissionName,
        },
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("Roles and permissions seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });