import * as doctorService from "./doctor.service.js";

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorService.getDoctors({
      search: req.query.search,
      specialization: req.query.specialization,
    });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const doctor = await doctorService.getMyProfile(req.user.userId);

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateMyProfile(
      req.user.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};