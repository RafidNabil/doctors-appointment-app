## ERD

```mermaid
        erDiagram

            USER {
                uuid id PK
                string email UK
                string passwordHash
                string role "PATIENT | DOCTOR | ADMIN"
                boolean isActive "true | false"
                datetime createdAt
                datetime updatedAt
            }

            PATIENT {
                uuid id PK
                uuid userId FK
                string firstName
                string lastName
                string phone
                date dateOfBirth 
                string gender
            }

            DOCTOR {
                uuid id PK
                uuid userId FK
                string firstName 
                string lastName 
                string phone 
                string specialization 
                string qualification 
                string experience 
                text bio 
                decimal consultationFee
            }

            ROLE {
                uuid id PK
                string name UK
            }

            PERMISSION {
                uuid id PK
                string name UK "e.g. MANAGE_APPOINTMENTS"
            }

            ROLE_PERMISSION {
                uuid roleId FK
                uuid permissionId FK
            }

            DOCTOR_SCHEDULE {
                uuid id PK
                uuid doctorId FK
                int dayOfWeek 
                time startTime 
                time endTime
            }

            APPOINTMENT {
                uuid id PK
                uuid patientId FK
                uuid doctorId FK
                date appointmentDate
                string status "CONFIRMED | COMPLETED | NO_SHOW | CANCELLED"
                string paymentStatus "PENDING | PAID"
                datetime createdAt
                datetime updatedAt
            }

            PRESCRIPTION {
                uuid id PK
                uuid appointmentId FK
            }

            PRESCRIPTION_ITEM {
                uuid id PK
                uuid prescriptionId FK
                string medication "e.g. Paracetamol 500mg"
                string dosage "e.g. 1 tablet"
                string frequency "e.g. 1+0+1"
                string duration "e.g. 5 days"
            }

            INVOICE {
                uuid id PK
                uuid appointmentId FK
                decimal amount
                decimal total
                string status "UNPAID | PAID"
                datetime issuedAt
            }

            PAYMENT {
                uuid id PK
                uuid invoiceId FK
                decimal amount
                string method "CASH | CARD | ONLINE"
                string status "PENDING | COMPLETED"
                string transactionId
                datetime paidAt
            }

            CLINIC_SETTING {
                uuid id PK
                string key UK "e.g. clinic_name"
                string value "e.g. City Care Clinic"
            }

            BOOKING_RULE {
                uuid id PK
                string key UK "e.g. max_appointments_per_period"
                string value "e.g. 300"
            }

            AUDIT_LOG {
                uuid id PK
                uuid userId FK
                string action "e.g. UPDATE_APPOINTMENT"
                string entityType "e.g. APPOINTMENT"
                uuid entityId
                json oldValue
                json newValue
                datetime createdAt
            }


            REFRESH_TOKEN {
                uuid id PK
                uuid userId FK
                string tokenHash
                datetime expiresAt
                datetime createdAt
                datetime revokedAt
            }


            USER ||--o| PATIENT : "has"
            USER ||--o| DOCTOR : "has"
            USER ||--o{ REFRESH_TOKEN : "has"

            ROLE ||--o{ ROLE_PERMISSION : contains
            PERMISSION ||--o{ ROLE_PERMISSION : assigned

            DOCTOR ||--o{ DOCTOR_SCHEDULE : has

            PATIENT ||--o{ APPOINTMENT : books
            DOCTOR ||--o{ APPOINTMENT : receives

            APPOINTMENT ||--o| PRESCRIPTION : has
            PRESCRIPTION ||--|{ PRESCRIPTION_ITEM : contains

            APPOINTMENT ||--o| INVOICE : generates
            INVOICE ||--o{ PAYMENT : receives

            USER ||--o{ AUDIT_LOG : performs

```

# Features

## Patient

-  Register / Login 
-  Manage profile 
-  Search & filter doctors 
-  View doctor profiles 
-  View available time slots 
-  Book appointment 
-  View upcoming appointments 
-  View appointment history 
-  Make payments 
-  View invoices / payment history 
-  View prescriptions  

## Doctor

-  Login 
-  Manage profile 
-  Set consultation fees 
-  Set working hours 
-  View upcoming appointments 
-  View appointment history 
-  Cancel / reschedule appointments 
-  Mark appointment completed 
-  Mark patient as no-show 
-  View patient information 
-  Create prescription for appointment

## Admin

-  Everything needed to manage the clinic 
-  Manage doctors 
-  Manage patients 
-  Manage appointments 
-  Manage schedules 
-  Manage payments & refunds 
-  Manage invoices  
-  View reports & analytics 
-  Configure clinic settings 
-  Configure booking rules 
-  Manage roles & permissions 
-  View audit/history records


## Backend Foler Structure

```
clinic-appointment/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.validation.js
│   │   │   │
│   │   │   ├── patient/
│   │   │   │   ├── patient.routes.js
│   │   │   │   ├── patient.controller.js
│   │   │   │   ├── patient.service.js
│   │   │   │   └── patient.validation.js
│   │   │   │
│   │   │   ├── doctor/
│   │   │   │   ├── doctor.routes.js
│   │   │   │   ├── doctor.controller.js
│   │   │   │   ├── doctor.service.js
│   │   │   │   └── doctor.validation.js
│   │   │   │
│   │   │   ├── appointment/
│   │   │   │   ├── appointment.routes.js
│   │   │   │   ├── appointment.controller.js
│   │   │   │   ├── appointment.service.js
│   │   │   │   └── appointment.validation.js
│   │   │   │
│   │   │   ├── prescription/
│   │   │   │   ├── prescription.routes.js
│   │   │   │   ├── prescription.controller.js
│   │   │   │   ├── prescription.service.js
│   │   │   │   └── prescription.validation.js
│   │   │   │
│   │   │   ├── invoice/
│   │   │   │   ├── invoice.routes.js
│   │   │   │   ├── invoice.controller.js
│   │   │   │   ├── invoice.service.js
│   │   │   │   └── invoice.validation.js
│   │   │   │
│   │   │   ├── payment/
│   │   │   │   ├── payment.routes.js
│   │   │   │   ├── payment.controller.js
│   │   │   │   ├── payment.service.js
│   │   │   │   └── payment.validation.js
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── admin.routes.js
│   │   │       ├── admin.controller.js
│   │   │       ├── admin.service.js
│   │   │       └── admin.validation.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   │
│   │   ├── config/
│   │   │   └── prisma.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── password.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── prisma.config.ts
│
└── frontend/
```