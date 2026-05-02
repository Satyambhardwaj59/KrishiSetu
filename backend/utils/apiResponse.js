/**
 * Standard API success response wrapper
 * @param {object} res  - Express response object
 * @param {number} statusCode
 * @param {string} message
 * @param {*}      data
 * @param {object} [meta]  - optional pagination / extra info
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Paginated response helper
 */
const sendPaginated = (res, message, data, page, limit, total) => {
  return sendSuccess(res, 200, message, data, {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
  });
};

module.exports = { sendSuccess, sendPaginated };
