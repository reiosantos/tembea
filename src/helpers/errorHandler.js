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
    return res.status(code).json({
      success: false,
      message,
      error,
    });
  }
}

export default HttpError;
