import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import tripService, { TripService } from '../../services/TripService';
import TeamDetailsService from '../../services/TeamDetailsService';
import UserService from '../../services/UserService';
import TripActionsController from '../slack/TripManagement/TripActionsController';
import GeneralValidator from '../../middlewares/GeneralValidator';
import HttpError from '../../helpers/errorHandler';
import TripHelper from '../../helpers/TripHelper';
import TravelTripService from '../../services/TravelTripService';
import ProviderNotifications from '../slack/SlackPrompts/notifications/ProviderNotifications';
import SlackProviderHelper from '../slack/helpers/slackHelpers/ProvidersHelper';

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
   * @method updateProviderAndNotify
   * @param {object} trip
   * @param {Response} res
   * @param {object} opts
   * @returns {object} Returns the HTTP response object
   * @description This method intercepts the `updateTrip` function
   * to update the provider and send a notification
   */
  static async updateProviderAndNotify(trip, res, opts) {
    const { tripId, providerId, payload } = opts;
    await tripService.updateRequest(tripId, { providerId });
    const { slackBotOauthToken } = await TripActionsController.getTripNotificationDetails(payload);
    const { providerUserSlackId, providerName } = await SlackProviderHelper.getProviderUserDetails(providerId);

    await ProviderNotifications.sendTripNotification(
      providerUserSlackId, providerName, slackBotOauthToken, trip
    );

    return res.status(200).json({
      success: true,
      message: 'The Provider for this trip was updated successfully',
    });
  }

  static appendPropsToPayload(payload, req) {
    const { body: { comment, isAssignProvider }, query: { action } } = req;
    const derivedPayload = Object.assign({}, payload);
    if (action === 'confirm') {
      try {
        derivedPayload.submission = TripsController.getConfirmationSubmission(req.body);
        const state = JSON.parse(derivedPayload.state);
        state.isAssignProvider = isAssignProvider;
        derivedPayload.state = JSON.stringify(state);
      } catch (err) {
        throw err;
      }
    }
    if (action === 'decline') {
      derivedPayload.submission = { opsDeclineComment: comment };
    }
    return derivedPayload;
  }

  /**
   * @description Updates the trip status
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async updateTrip(req, res) {
    const {
      params: { tripId }, query: { action }, body: { slackUrl, providerId }, currentUser
    } = req;
    const payload = await TripsController.getCommonPayloadParam(currentUser, slackUrl, tripId);

    const trip = await tripService.getById(tripId, true);
    const tripHasProvider = TripHelper.tripHasProvider(trip);
    if (tripHasProvider && !action) {
      await TripsController.updateProviderAndNotify(trip, res, { tripId, providerId, payload });
    }
    const actionSuccessMessage = action === 'confirm' ? 'trip confirmed' : 'trip declined';
    let derivedPayload;
    try {
      derivedPayload = TripsController.appendPropsToPayload(payload, req);
    } catch (err) {
      return HttpError.sendErrorResponse({ success: false, message: err.customMessage }, res);
    }

    const result = await TripActionsController.changeTripStatus(derivedPayload);
    const responseMessage = result === 'success' ? actionSuccessMessage : result.text;
    return res.status(200).json({ success: result === 'success', message: responseMessage });
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
      driverName, driverPhoneNo, regNumber, comment, isAssignProvider, selectedProviderId
    } = reqBody;
    if (isAssignProvider) {
      return {
        selectedProviderId,
        confirmationComment: comment,
      };
    }
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

  /**
   ** @description gets the Travel trips,cost, count and average
   *  rating for specified period by department
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */

  static async getTravelTrips(req, res) {
    const { startDate, endDate, departmentList } = req.body;
    const travelTrips = await TravelTripService.getCompletedTravelTrips(
      startDate, endDate, departmentList
    );

    const result = travelTrips.map((trip) => {
      const tripObject = trip;
      tripObject.averageRating = parseFloat(trip.averageRating).toFixed(2);
      return tripObject;
    });

    return Response.sendResponse(res, 200, true, 'Request was successful', result);
  }
}

export default TripsController;
