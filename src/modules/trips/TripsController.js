import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import tripService, { TripService } from '../../services/TripService';
import TeamDetailsService from '../../services/TeamDetailsService';
import UserService from '../../services/UserService';
import TripActionsController from '../slack/TripManagement/TripActionsController';
import GeneralValidator from '../../middlewares/GeneralValidator';
import HttpError from '../../helpers/errorHandler';
import TripHelper from '../../helpers/TripHelper';

class TripsController {
  static async getTrips(req, res) {
    try {
      let { page, size } = req.query;
      page = page || 1;
      size = size || defaultSize;
      const query = TripsController.getRequestQuery(req);
      const where = TripService.sequelizeWhereClauseOption(query);
      const pageable = { page, size };
      const {
        totalPages, trips, pageNo, totalItems, itemsPerPage
      } = await tripService.getTrips(pageable, where);
      const message = `${pageNo} of ${totalPages} page(s).`;
      const pageData = {
        pageMeta: {
          totalPages,
          page: pageNo,
          totalResults: totalItems,
          pageSize: itemsPerPage
        },
        trips
      };
      return Response.sendResponse(res, 200, true, message, pageData);
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }

  static getRequestQuery(req) {
    const departureTime = TripHelper.cleanDateQueryParam(req.query, 'departureTime');
    const requestedOn = TripHelper.cleanDateQueryParam(req.query, 'requestedOn');
    return {
      ...req.query,
      requestedOn,
      departureTime
    };
  }

  /**
   * @description Updates the trip status
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async updateTrip(req, res) {
    const { params: { tripId }, query: { action }, body: { slackUrl } } = req;
    const payload = await TripsController.getCommonPayloadParam(req.currentUser, slackUrl, tripId);
    let actionSuccessMessage = '';
    if (action === 'confirm') {
      actionSuccessMessage = 'trip confirmed';
      try {
        payload.submission = TripsController.getConfirmationSubmission(req.body);
      } catch (err) {
        return HttpError.sendErrorResponse({ success: false, message: err.customMessage }, res);
      }
    }
    if (action === 'decline') {
      actionSuccessMessage = 'trip declined';
      payload.submission = { opsDeclineComment: req.body.comment };
    }
    const result = await TripActionsController.changeTripStatus(payload);
    if (result !== 'success') {
      return res.status(200).json({ success: false, message: result.text });
    }
    return res.status(200).json({ success: true, message: actionSuccessMessage });
  }

  static async getSlackIdFromReq(user) {
    const { userInfo: { email } } = user;
    const { slackId: userId } = await UserService.getUserByEmail(email);
    return userId;
  }

  static async getCommonPayloadParam(user, slackUrl, tripId) {
    const userId = await TripsController.getSlackIdFromReq(user);
    const { teamId, opsChannelId } = await TeamDetailsService.getTeamDetailsByTeamUrl(slackUrl);
    const state = JSON.stringify({
      trip: tripId,
      tripId,
      actionTs: +new Date()
    });
    const payload = {
      submission: {},
      user: { id: userId },
      team: { id: teamId },
      channel: { id: opsChannelId },
      state
    };
    return payload;
  }

  static getConfirmationSubmission(reqBody) {
    const {
      driverName, driverPhoneNo, regNumber, comment
    } = reqBody;
    const messages = GeneralValidator.validateReqBody(
      reqBody,
      'driverName',
      'driverPhoneNo',
      'regNumber',
      'slackUrl'
    );
    if (messages.length) {
      const error = new Error();
      error.customMessage = messages;
      throw error;
    }
    return {
      confirmationComment: comment, driverName, driverPhoneNo, regNumber
    };
  }
}

export default TripsController;
