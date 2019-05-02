import BatchUseRecordService from '../../services/BatchUseRecordService';
import HttpError from '../../helpers/errorHandler';
import {
  DEFAULT_SIZE as defaultSize
} from '../../helpers/constants';
import UserService from '../../services/UserService';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import aisService from '../../services/AISService';

class FellowController {
  static async getFellowRouteActivity(req, res) {
    try {
      let { page, size } = req.query;
      page = page || 1;
      size = size || defaultSize;
      const pageable = { page, size };
      const { query: { id } } = req;
      const fellowRouteActivity = await BatchUseRecordService.getBatchUseRecord(
        pageable, { userId: id }
      );
      const message = 'Successful!';
      return res
        .status(200)
        .json({
          success: true,
          message,
          ...fellowRouteActivity
        });
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description Gets all Fellow details
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async getAllFellows(req, res) {
    const size = req.query.size || 100;
    const page = req.query.page || 1;
    const { query: { onRoute } } = req;
    try {
      const data = await UserService.getPagedFellowsOnOrOffRoute(onRoute, size, page);
      if (data.data.length < 1) {
        const { data: fellows, pageMeta } = data;
        return res.json({
          success: true,
          fellows,
          pageMeta
        });
      }

      const fellowData = await Promise.all(data.data.map(
        fellow => FellowController.mergeFellowData(fellow.id, fellow.email)
      ));
      return res.json({
        success: true,
        fellows: fellowData,
        pageMeta: data.pageMeta
      });
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async mergeFellowData(id, email) {
    const [user, ais] = await Promise.all(
      [
        BatchUseRecordService.getUserRouteRecord(id),
        aisService.getUserDetails(email)
      ]
    );
    const {
      name,
      picture,
      placement
    } = ais;
    const finalUserData = {
      name,
      picture,
      placement,
      ...user
    };
    return finalUserData;
  }
}
export default FellowController;
