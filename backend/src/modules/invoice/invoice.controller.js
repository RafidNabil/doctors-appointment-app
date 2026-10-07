import {
  createInvoice as createInvoiceService,
  deleteInvoice as deleteInvoiceService,
  getInvoiceById as getInvoiceByIdService,
  getMyInvoices as getMyInvoicesService,
} from "./invoice.service.js";



export const createInvoice = async (req, res, next) => {
  try {
    const invoice = await createInvoiceService(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    const result = await deleteInvoiceService(req.user.userId, req.params.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await getInvoiceByIdService(
      req.user.userId,
      req.user.role,
      req.params.id
    );

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await getMyInvoicesService(
      req.user.userId,
      req.user.role
    );

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};