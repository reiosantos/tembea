import sequelize from 'sequelize';


export default class ErrorTypeChecker {
  /**
   * @description Checks for instance of sequelize Validation error
   * @returns {object} custom message and status code of 400
   * @example ErrorTypeChecker.checkSequelizeValidationError(error,'Name already Taken');
   * @param error
   * @param message
   */
  static checkSequelizeValidationError(error, message) {
    if (error instanceof sequelize.ValidationError) {
      return { message, statusCode: 400 };
    }
    return error;
  }
}
