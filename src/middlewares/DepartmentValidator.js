import {
  updateDepartmentSchema,
  newDepartmentSchema,
  deleteDepartmentSchema,
  departmentTripsSchema,
  tripTypeSchema
} from './ValidationSchemas';
import GeneralValidator from './GeneralValidator';

class DepartmentValidator {
  /**
   * @description This middleware checks for the required properties
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateUpdateBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, updateDepartmentSchema);
  }

  static validateAddBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, newDepartmentSchema);
  }


  /**
   * @description This method ensures the required parameter is present
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @param  {object} next The next middleware
   * @return {object} The http response object or the next middleware
   */
  static validateDeleteProps(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, deleteDepartmentSchema);
  }

  static async validateDepartmentTrips(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, departmentTripsSchema);
  }

  static async validateTripType(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.query, tripTypeSchema, false, true);
  }
}

export default DepartmentValidator;
