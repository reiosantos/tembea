import { messages } from './constants';

const { VALIDATION_ERROR } = messages;

class HttpError extends Error {
  constructor(message, code = 500, error) {
    super();
    this.message = message;
    this.statusCode = code;
    this.error = error;
  }

  static throwErrorIfNull(data, message, code = 404) {
    if (!data) {
      throw new HttpError(message, code);
    }
  }

  static sendErrorResponse(errorInstance, res) {
    const code = errorInstance.statusCode || 500;
    const { message, error } = errorInstance;
    res.status(code).json({
      success: false,
      message,
      error,
    });
  }

  /**
   * Formats joi validation error
   *
   * @static
   * @param {object} error - Joi validation error
   * @returns {object} Formatted error object
   * @memberof HttpError
   */
  static formatValidationError(error) {
    const { details: errorDetails } = error;
    const inputErrors = {};
    errorDetails.forEach((err) => {
      const { context: { key }, message } = err;
      inputErrors[key] = message;
    });
    const validationError = new HttpError(VALIDATION_ERROR, 400, inputErrors);
    return validationError;
  }
}

export default HttpError;
