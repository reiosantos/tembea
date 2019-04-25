import Response from '../helpers/responseHelper';
import CountryHelper from '../helpers/CountryHelper';
import DepartmentValidator from './DepartmentValidator';
import HomebaseHelper from '../helpers/HomebaseHelper';

class HomebaseValidator {
  /**
     * @description This middleware checks that the country named exists
     * @param  {object} req The HTTP request sent
     * @param  {object} res The HTTP response object
     * @param  {function} next The next middleware
     * @return {any} The next middleware or the http response
     */
  static async validateCountryExists(req, res, next) {
    const { body: { countryName } } = req;
    if (countryName) {
      const message = `The country with name: '${countryName}' does not exist`;
      const countryExists = await CountryHelper.checkIfCountryExists(countryName);
      if (!countryExists) {
        return Response.sendResponse(res, 404, false, message);
      }
    }
    return next();
  }

  /**
     * @description This middleware checks that country and homebase names are valid
     * @param  {object} req The HTTP request sent
     * @param  {object} res The HTTP response object
     * @param  {function} next The next middleware
     * @return {any} The next middleware or the http response
     */
  static validateNames(req, res, next) {
    const messages = HomebaseHelper.validateProps(req.body, 'countryName', 'homebaseName');
    DepartmentValidator.checkLengthOfMessageArray(messages, res, next);
  }
}

export default HomebaseValidator;
