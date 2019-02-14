import aisService from '../../services/AISService';
import BugsnagHelper from '../../helpers/bugsnagHelper';
import HttpError from '../../helpers/errorHandler';

export default class AISController {
  /**
   * @description Get user records from AIS
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async getUserDataByEmail(req, res) {
    const { email } = req.query;
    try {
      const aisUserData = await aisService.getUserDetails(email);
      HttpError.throwErrorIfNull(aisUserData, 'Could not retrieve data from AIS');
      return res.status(200).json({
        success: 'true',
        aisUserData
      });
    } catch (error) {
      BugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }
}
