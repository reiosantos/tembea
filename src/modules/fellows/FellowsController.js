import BatchUseRecordService from '../../services/BatchUseRecordService';
import HttpError from '../../helpers/errorHandler';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import BugsnagHelper from '../../helpers/bugsnagHelper';

class FellowsController {
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
      BugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }
}
export default FellowsController;
