import HttpError from '../../helpers/errorHandler';
import BugSnagHelper from '../../helpers/bugsnagHelper';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import RouteService from '../../services/RouteService';
import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import { RoutesHelper } from '../../helpers/googleMaps/googleMapsHelpers';
import {
  GoogleMapsPlaceDetails,
  slackEventNames,
  SlackEvents,
  SlackInteractiveMessage
} from '../slack/RouteManagement/rootFile';
import AddressService from '../../services/AddressService';
import RouteRequestService from '../../services/RouteRequestService';
import UserService from '../../services/UserService';
import RouteHelper from '../../helpers/RouteHelper';
import RemoveDataValues from '../../helpers/removeDataValues';
import RouteNotifications from '../slack/SlackPrompts/notifications/RouteNotifications';
import TeamDetailsService from '../../services/TeamDetailsService';
import slackEvents from '../slack/events';

class RoutesController {
  /**
   * @description Read the routes batch records
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async getRoutes(req, res) {
    try {
      let {
        page, size, sort, name
      } = req.query;
      page = page || 1;
      size = size || defaultSize;
      name = name || null;
      const { status } = req.query;
      sort = SequelizePaginationHelper.deserializeSort(sort || 'name,asc,id,asc');
      const pageable = { page, size, sort };
      const where = { name, status };
      const { ...result } = await RouteService.getRoutes(pageable, where);
      const message = `${result.pageNo} of ${result.totalPages} page(s).`;
      const routeData = RouteHelper.pageDataObject(result);
      return Response.sendResponse(res, 200, true, message, routeData);
    } catch (error) {
      BugSnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async createRoute(req, res) {
    let message;
    let routeInfo;
    const { body } = req;
    try {
      const { action, batchId } = req.query;
      if (action === 'duplicate' && batchId) {
        routeInfo = await RouteHelper.duplicateRouteBatch(batchId);
        message = `Successfully duplicated ${routeInfo.name} route`;
      } else if (!batchId) {
        routeInfo = await RouteHelper.createNewRouteBatch(body);
        const { teamUrl, provider } = body;
        const { botToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
        slackEvents.raise(slackEventNames.SEND_PROVIDER_CREATED_ROUTE_REQUEST, routeInfo, provider, botToken);
        message = 'Route created successfully';
      }
      return Response.sendResponse(res, 200, true, message, routeInfo);
    } catch (error) {
      BugSnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async saveDestination(destinationCoordinates) {
    const [lat, long] = destinationCoordinates.split(',');
    let address = await AddressService.findAddressByCoordinates(long, lat);

    if (address) {
      return address;
    }
    const place = await RoutesHelper.getPlaceInfo(
      'coordinates', destinationCoordinates
    );

    if (!place) {
      // inform user if coordinates did not point to a location
      HttpError.throwErrorIfNull(null, 'Invalid Coordinates', 400);
    }

    const { geometry: { location: { lat: latitude, lng: longitude } } } = place;

    const placeDetails = await GoogleMapsPlaceDetails.getPlaceDetails(
      place.place_id
    );
    address = `${placeDetails.result.name}, ${
      placeDetails.result.formatted_address
    }`;
    return AddressService.createNewAddress(longitude, latitude, address);
  }

  /**
   * returns all route requests
   * @param req
   * @param res
   * @returns {Promise<*>}
   * @typedef RouteRequest
   * @type {Object}
   * @property {number} id: route ID
   * @property {string} distance: distance of the route
   * @property {string} opsComment: Comment made by operations
   * @property {string} managerComment: Comment made by a manager
   * @property {string} busStopDistance: distance of the busStop from home
   * @property {string} routeImageUrl: image URL for the map
   * @property {string} status: status of the route
   * @property {Engagement: {Object}} engagement: engagement details of fellow
   * @property {User: {Object}} manager: manager details
   * @property {Location: {Object}} busStop: bus stop location
   * @property {Location: {Object}} home: home location
   */
  static async getAll(req, res) {
    try {
      const routes = await RouteRequestService.getAllConfirmedRouteRequests();
      return res.status(200).json({ routes });
    } catch (e) {
      return res.status(500).json({ message: 'An error has occurred', success: false });
    }
  }

  /**
   * @description returns a given route's details
   * @param req
   * @param res
   * @returns {object} The http response object
   */
  static async getOne(req, res) {
    try {
      const route = await RouteService.getRoute(req.params.id);
      return res.status(200).json({
        message: 'Success',
        route
      });
    } catch (error) {
      BugSnagHelper.log(error);
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
  }

  /**
   * @description update the routes batch records
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async updateRouteBatch(req, res) {
    try {
      const { body, params: { routeId: id } } = req;
      const result = await RouteService.updateRouteBatch(+id, body);
      const slackTeamUrl = body.teamUrl.trim();
      SlackEvents.raise(slackEventNames.NOTIFY_ROUTE_RIDERS, slackTeamUrl, result);
      const message = 'Route batch successfully updated';
      return Response.sendResponse(res, 200, true, message, result);
    } catch (error) {
      BugSnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description This method changes the status of a route request
   * @param  {Object} req The HTTP request object
   * @param  {Object} res The HTTP response object
   */
  static async updateRouteRequestStatus(req, res) {
    try {
      const { params: { requestId }, body } = req;
      let routeRequest = await RouteRequestService.getRouteRequest(requestId);

      if (!(routeRequest && routeRequest.dataValues)) {
        return Response.sendResponse(res, 404, false, 'Route request not found.');
      }

      routeRequest = RemoveDataValues.removeDataValues(routeRequest);
      req.body.reviewerEmail = req.currentUser.userInfo.email;
      const checkStatus = RouteHelper.validateRouteStatus(routeRequest);
      if (checkStatus !== true) {
        return Response.sendResponse(res, 409, false, checkStatus);
      }

      const updated = await RoutesController.getUpdatedRouteRequest(requestId, body);
      await RoutesController.sendRouteRequestNotifications(updated, body, routeRequest, requestId);

      return res.status(201).json({
        success: true,
        message: 'This route request has been updated'
      });
    } catch (error) {
      BugSnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async getUpdatedRouteRequest(routeId, body) {
    try {
      let reviewer = await UserService.getUserByEmail(body.reviewerEmail);
      reviewer = RemoveDataValues.removeDataValues(reviewer);

      const updateData = {
        status: body.newOpsStatus === 'approve' ? 'Approved' : 'Declined',
        opsComment: body.comment,
        opsReviewerId: reviewer.id
      };

      const updatedRouteRequest = await RouteRequestService.updateRouteRequest(
        routeId, updateData
      );
      return RemoveDataValues.removeDataValues(updatedRouteRequest);
    } catch (error) {
      BugSnagHelper.log(error);
      return HttpError.sendErrorResponse(error);
    }
  }

  static async sendRouteRequestNotifications(updated, body, routeRequest, routeId) {
    const submission = RoutesController.formatRoute(routeRequest, body);
    if (updated.status === 'Approved') {
      await RoutesController.sendNotificationToProvider(updated, submission);
    } else {
      await RoutesController.sendDeclineNotificationToFellow(routeId, body.teamUrl);
    }
  }

  /**
   * @description format updated request data to be sent to provider
   * @param  {object} routeRequest The created route request
   * @param  {object} body The request body containing update info
   * @returns {object} The submission containing route info
   */

  static formatRoute(routeRequest, body) {
    const submission = {
      routeName: body.routeName,
      takeOffTime: body.takeOff,
      teamUrl: body.teamUrl,
      provider: body.provider
    };

    return submission;
  }

  static sendDeclineNotificationToFellow(routeId, teamUrl) {
    SlackEvents.raise(slackEventNames.OPERATIONS_DECLINE_ROUTE_REQUEST, routeId, '', teamUrl);
  }

  static async sendNotificationToProvider(routeRequest, submission) {
    SlackEvents.raise(
      slackEventNames.COMPLETE_ROUTE_APPROVAL, routeRequest, submission
    );
  }

  /**
   * @description This method deletes a routeBatch
   * @param  {Object} req The HTTP request object
   * @param  {Object} res The HTTP response object
   * @returns {object} The http response object
   */
  static async deleteRouteBatch(req, res) {
    let message;
    try {
      const { params: { routeBatchId }, body: { teamUrl } } = req;
      const slackTeamUrl = teamUrl.trim();
      const routeBatch = await RouteService.getRouteBatchByPk(routeBatchId);
      if (!routeBatch) {
        message = 'route batch not found';
        HttpError.throwErrorIfNull(routeBatch, message);
      }
      const result = await RouteService.deleteRouteBatch(routeBatchId);
      if (result > 0) {
        routeBatch.deleted = true;
        await SlackEvents.raise(slackEventNames.NOTIFY_ROUTE_RIDERS, slackTeamUrl, routeBatch);
        message = 'route batch deleted successfully';
        return Response.sendResponse(res, 200, true, message);
      }
    } catch (error) {
      BugSnagHelper.log(error);
      return HttpError.sendErrorResponse(error, res);
    }
  }

  static async deleteFellowFromRoute(req, res) {
    try {
      const { params: { userId }, body: { teamUrl } } = req;
      let message = 'user doesn\'t belong to this route';
      const { dataValues: { routeBatchId, slackId } } = await UserService.getUserById(userId);
      if (routeBatchId && slackId) {
        await UserService.updateUser(userId, { routeBatchId: null });
        const { botToken: teamBotOauthToken } = await TeamDetailsService
          .getTeamDetailsByTeamUrl(teamUrl);
        const {
          route: { name }
        } = await RouteService.getRoute(routeBatchId);
        const text = '*:information_source: Reach out to Ops department for any questions*';
        const slackMessage = new SlackInteractiveMessage(
          `*Hey <@${slackId}>, You've been removed from \`${name}\` route.* \n ${text}.`
        );
        await RouteNotifications.sendNotificationToRider(slackMessage, slackId, teamBotOauthToken);
        message = 'fellow successfully removed from the route';
      }
      return Response.sendResponse(res, 200, true, message);
    } catch (error) {
      BugSnagHelper.log(error);
      return HttpError.sendErrorResponse(error, res);
    }
  }
}
export default RoutesController;
