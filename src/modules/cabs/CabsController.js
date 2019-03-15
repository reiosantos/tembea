import CabService from '../../services/CabService';
import BugsnagHelper from '../../helpers/bugsnagHelper';
import HttpError from '../../helpers/errorHandler';


class CabsController {
  static async createCab(req, res) {
    try {
      const {
        body: {
          driverName, driverPhoneNo, regNumber, capacity, model, location
        }
      } = req;
      const { _options: { isNewRecord } } = await CabService.findOrCreateCab(
        driverName, driverPhoneNo, regNumber, capacity, model, location
      );
      if (isNewRecord) {
        return res.status(201).json({
          success: true,
          message: 'You have successfully created a cab'
        });
      }
      const recordConflictError = {
        message: 'Cab registration or drivers number already exists'
      };
      HttpError.sendErrorResponse(recordConflictError, res);
    } catch (e) {
      BugsnagHelper.log(e);
      HttpError.sendErrorResponse({ message: 'Oops! Something went terribly wrong' }, res);
    }
  }
}

export default CabsController;
