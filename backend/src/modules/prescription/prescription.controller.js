import {
  createPrescription as createPrescriptionService,
  updatePrescription as updatePrescriptionService,
  getPrescriptionById as getPrescriptionByIdService,
  getMyPrescriptions as getMyPrescriptionsService,
} from "./prescription.service.js";

export const createPrescription = async (req, res, next) => {
  try {
    const prescription = await createPrescriptionService(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await getPrescriptionByIdService(
      req.user.userId,
      req.user.role,
      req.params.id
    );

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await getMyPrescriptionsService(
      req.user.userId,
      req.user.role
    );

    res.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await updatePrescriptionService(
      req.user.userId,
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};