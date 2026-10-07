import {
  getDoctors as getDoctorsService,
  getDoctorById as getDoctorByIdService,
  updateDoctorStatus as updateDoctorStatusService,

  getPatients as getPatientsService,
  getPatientById as getPatientByIdService,
  updatePatientStatus as updatePatientStatusService,

  getAppointments as getAppointmentsService,
  getAppointmentById as getAppointmentByIdService,
  updateAppointmentStatus as updateAppointmentStatusService,

  getDoctorSchedules as getDoctorSchedulesService,
  createDoctorSchedule as createDoctorScheduleService,
  updateDoctorSchedule as updateDoctorScheduleService,
  deleteDoctorSchedule as deleteDoctorScheduleService,

  getOverviewReport as getOverviewReportService,
  getAppointmentReport as getAppointmentReportService,
  getRevenueReport as getRevenueReportService,

  getSettings as getSettingsService,
  createSetting as createSettingService,
  updateSetting as updateSettingService,
  deleteSetting as deleteSettingService,

  getBookingRules as getBookingRulesService,
  createBookingRule as createBookingRuleService,
  updateBookingRule as updateBookingRuleService,
  deleteBookingRule as deleteBookingRuleService,

  getRoles as getRolesService,
  createRole as createRoleService,
  updateRole as updateRoleService,
  deleteRole as deleteRoleService,

  getPermissions as getPermissionsService,
  createPermission as createPermissionService,
  updatePermission as updatePermissionService,
  deletePermission as deletePermissionService,
  assignPermissionToRole as assignPermissionToRoleService,
  removePermissionFromRole as removePermissionFromRoleService,

  getAuditLogs as getAuditLogsService,
  getAuditLogById as getAuditLogByIdService,
} from "./admin.service.js";

/* =========================
   DOCTORS
========================= */

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await getDoctorsService();

    res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await getDoctorByIdService(req.params.id);

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await updateDoctorStatusService(
      req.params.id,
      req.body.isActive
    );

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   PATIENTS
========================= */

export const getPatients = async (req, res, next) => {
  try {
    const patients = await getPatientsService();

    res.json({
      success: true,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patient = await getPatientByIdService(req.params.id);

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatientStatus = async (req, res, next) => {
  try {
    const patient = await updatePatientStatusService(
      req.params.id,
      req.body.isActive
    );

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   APPOINTMENTS
========================= */

export const getAppointments = async (req, res, next) => {
  try {
    const appointments = await getAppointmentsService();

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await getAppointmentByIdService(
      req.params.id
    );

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (
  req,
  res,
  next
) => {
  try {
    const appointment =
      await updateAppointmentStatusService(
        req.params.id,
        req.body.status
      );

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   SCHEDULES
========================= */

export const getDoctorSchedules = async (
  req,
  res,
  next
) => {
  try {
    const schedules =
      await getDoctorSchedulesService(req.params.doctorId);

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctorSchedule = async (
  req,
  res,
  next
) => {
  try {
    const schedule =
      await createDoctorScheduleService(
        req.params.doctorId,
        req.body
      );

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorSchedule = async (
  req,
  res,
  next
) => {
  try {
    const schedule =
      await updateDoctorScheduleService(
        req.params.id,
        req.body
      );

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctorSchedule = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await deleteDoctorScheduleService(req.params.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   REPORTS
========================= */

export const getOverviewReport = async (
  req,
  res,
  next
) => {
  try {
    const report = await getOverviewReportService();

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentReport = async (
  req,
  res,
  next
) => {
  try {
    const report = await getAppointmentReportService();

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueReport = async (
  req,
  res,
  next
) => {
  try {
    const report = await getRevenueReportService();

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   SETTINGS
========================= */

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getSettingsService();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const createSetting = async (
  req,
  res,
  next
) => {
  try {
    const setting = await createSettingService(req.body);

    res.status(201).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSetting = async (
  req,
  res,
  next
) => {
  try {
    const setting = await updateSettingService(
      req.params.id,
      req.body.value
    );

    res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSetting = async (
  req,
  res,
  next
) => {
  try {
    const result = await deleteSettingService(
      req.params.id
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   BOOKING RULES
========================= */

export const getBookingRules = async (
  req,
  res,
  next
) => {
  try {
    const rules = await getBookingRulesService();

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

export const createBookingRule = async (
  req,
  res,
  next
) => {
  try {
    const rule = await createBookingRuleService(req.body);

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingRule = async (
  req,
  res,
  next
) => {
  try {
    const rule = await updateBookingRuleService(
      req.params.id,
      req.body.value
    );

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBookingRule = async (
  req,
  res,
  next
) => {
  try {
    const result = await deleteBookingRuleService(
      req.params.id
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   ROLES
========================= */

export const getRoles = async (req, res, next) => {
  try {
    const roles = await getRolesService();

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const role = await createRoleService(req.body);

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const role = await updateRoleService(
      req.params.id,
      req.body.name
    );

    res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const result = await deleteRoleService(req.params.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   PERMISSIONS
========================= */

export const getPermissions = async (
  req,
  res,
  next
) => {
  try {
    const permissions = await getPermissionsService();

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

export const createPermission = async (
  req,
  res,
  next
) => {
  try {
    const permission =
      await createPermissionService(req.body);

    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePermission = async (
  req,
  res,
  next
) => {
  try {
    const permission =
      await updatePermissionService(
        req.params.id,
        req.body.name
      );

    res.json({
      success: true,
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePermission = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await deletePermissionService(req.params.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const assignPermissionToRole = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await assignPermissionToRoleService(
        req.params.roleId,
        req.body.permissionId
      );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const removePermissionFromRole = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await removePermissionFromRoleService(
        req.params.roleId,
        req.params.permissionId
      );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   AUDIT LOGS
========================= */

export const getAuditLogs = async (
  req,
  res,
  next
) => {
  try {
    const logs = await getAuditLogsService(req.query);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogById = async (
  req,
  res,
  next
) => {
  try {
    const log = await getAuditLogByIdService(
      req.params.id
    );

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};