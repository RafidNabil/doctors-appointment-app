export const createAuditLog = async (tx, data) => {
  return tx.auditLog.create({
    data,
  });
};