import * as appointmentService from "./appointment.service.js";

export const getAvailableSlots = async (req, res, next) => {
  try {
    const result = await appointmentService.getAvailableSlots(
      req.query.doctorId,
      req.query.date
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (req, res, next) => {
  try {
    const appointment =
      await appointmentService.bookAppointment(
        req.user.userId,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingAppointments = async (
  req,
  res,
  next
) => {
  try {
    const appointments =
      await appointmentService.getUpcomingAppointments(
        req.user.userId,
        req.user.role
      );

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentHistory = async (
  req,
  res,
  next
) => {
  try {
    const appointments =
      await appointmentService.getAppointmentHistory(
        req.user.userId,
        req.user.role
      );

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (
  req,
  res,
  next
) => {
  try {
    const appointment =
      await appointmentService.cancelAppointment(
        req.user.userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (
  req,
  res,
  next
) => {
  try {
    const appointment =
      await appointmentService.rescheduleAppointment(
        req.user.userId,
        req.params.id,
        req.body.appointmentDate
      );

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const completeAppointment = async (
  req,
  res,
  next
) => {
  try {
    const appointment =
      await appointmentService.completeAppointment(
        req.user.userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Appointment marked as completed",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const markNoShow = async (req, res, next) => {
  try {
    const appointment =
      await appointmentService.markNoShow(
        req.user.userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Patient marked as no-show",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentPatient = async (
  req,
  res,
  next
) => {
  try {
    const appointment =
      await appointmentService.getAppointmentPatient(
        req.user.userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};