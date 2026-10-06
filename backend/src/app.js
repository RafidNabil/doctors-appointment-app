import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import doctorRoutes from "./modules/doctor/doctor.routes.js";
import patientRoutes from "./modules/patient/patient.routes.js";
import appointmentRoutes from "./modules/appointment/appointment.routes.js";
import prescriptionRoutes from "./modules/prescription/prescription.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Clinic Appointment API is running",
  });
});

export default app;