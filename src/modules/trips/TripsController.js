import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import tripService, { TripService } from '../../services/TripService';
import TeamDetailsService from '../../services/TeamDetailsService';
import UserService from '../../services/UserService';
import RouteUseRecordService from '../../services/RouteUseRecordService';
import TripActionsController from '../slack/TripManagement/TripActionsController';
import HttpError from '../../helpers/errorHandler';
import TripHelper from '../../helpers/TripHelper';
import TravelTripService from '../../services/TravelTripService';

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

  static appendPropsToPayload(payload, req) {
    const { body: { comment, isAssignProvider }, query: { action } } = req;
    const derivedPayload = Object.assign({}, payload);
    if (action === 'confirm') {
      derivedPayload.submission = TripsController.getConfirmationSubmission(req.body);
      const state = JSON.parse(derivedPayload.state);
      state.isAssignProvider = isAssignProvider;
      derivedPayload.state = JSON.stringify(state);
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
      params: { tripId }, query: { action }, body: { slackUrl }, currentUser
    } = req;
    const payload = await TripsController.getCommonPayloadParam(currentUser, slackUrl, tripId);

    const actionSuccessMessage = action === 'confirm' ? 'trip confirmed' : 'trip declined';
    const derivedPayload = TripsController.appendPropsToPayload(payload, req);
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
      driverName, driverPhoneNo, regNumber, comment, providerId
    } = reqBody;
    return {
      confirmationComment: comment,
      driverName,
      driverPhoneNo,
      regNumber,
      providerId
    };
  }

  /**
   * @description gets the Travel trips,cost, count and average
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
    const { finalCost, finalAverageRating, count } = await
    TripHelper.calculateSums(result);

    const data = {
      trips: result, finalCost, finalAverageRating, count
    };
    return Response.sendResponse(res, 200, true, 'Request was successful', data);
  }

  static async getRouteTrips(req, res) {
    const { page = 1, size = 10 } = req.query;
    try {
      let routeTrips = await RouteUseRecordService.getRouteTripRecords({ page, size });
      if (!routeTrips.data) {
        return Response.sendResponse(res, 200, true, 'No route trips available yet', []);
      }

      const { pageMeta, data } = routeTrips;
      routeTrips = RouteUseRecordService.getAdditionalInfo(data);
      const result = { pageMeta: { ...pageMeta }, data: routeTrips };
      return Response
        .sendResponse(res, 200, true, 'Route trips retrieved successfully', result);
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default TripsController;
