class HttpError extends Error {
  constructor(message, code = 500) {
    super();
    this.message = message;
    this.statusCode = code;
  }

  static throwErrorIfNull(data, message, code = 404) {
    if (!data) {
      throw new HttpError(message, code);
    }
  }

  static sendErrorResponse(error, res) {
    const code = error.statusCode || 500;
    const { message } = error;
    res.status(code).json({
      success: false,
      message
    });
  }
}

export default HttpError;
