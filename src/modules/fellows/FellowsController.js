import BatchUseRecordService from '../../services/BatchUseRecordService';
import HttpError from '../../helpers/errorHandler';
import {
  DEFAULT_SIZE as defaultSize
} from '../../helpers/constants';
import UserService from '../../services/UserService';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import aisService from '../../services/AISService';
import Response from '../../helpers/responseHelper';

class FellowController {
  static async getFellowRouteActivity(req, res) {
    try {
      const {
        query: {
          page = 1, size = defaultSize, id: userId
        },
        headers: { homebaseid: homebaseId }
      } = req;
      const pageable = { page, size };
      const fellowRouteActivity = await BatchUseRecordService.getBatchUseRecord(
        pageable, { homebaseId, userId }
      );
      return res
        .status(200)
        .json({
          success: true,
          message: 'Successful',
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
    const {
      query: { onRoute, page = 1, size = defaultSize },
      headers: { homebaseid: homebaseId }
    } = req;
    try {
      const data = await UserService.getPagedFellowsOnOrOffRoute(onRoute, { size, page }, { homebaseId });
      const fellowsData = await Promise.all(data.data.map(
        fellow => FellowController.mergeFellowData(fellow.id, fellow.email)
      ));
      return Response.sendResponse(res, 200, true, 'Request was successful', {
        fellows: fellowsData,
        pageMeta: data.pageMeta,
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
