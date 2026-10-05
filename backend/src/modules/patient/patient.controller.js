import * as patientService from "./patient.service.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const patient = await patientService.getMyProfile(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const patient = await patientService.updateMyProfile(
      req.user.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};