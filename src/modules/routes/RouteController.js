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
import RouteNotifications from '../slack/SlackPrompts/notifications/RouteNotifications';
import TeamDetailsService from '../../services/TeamDetailsService';

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
      const pageData = {
        pageMeta: {
          totalPages: result.totalPages,
          page: result.pageNo,
          totalResults: result.totalItems.length,
          pageSize: result.itemsPerPage
        },
        routes: result.routes
      };
      return Response.sendResponse(res, 200, true, message, pageData);
    } catch (error) {
      BugSnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async createRoute(req, res) {
    let message;
    let routeInfo;
    try {
      const { action, batchId } = req.query;
      if (action === 'duplicate' && batchId) {
        routeInfo = await RouteHelper.duplicateRouteBatch(batchId);
        message = `Successfully duplicated ${routeInfo.name} route`;
      } else if (!batchId) {
        routeInfo = await RouteHelper.createNewRouteBatch(req.body);
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
      const { params: { requestId } } = req;
      const { body } = req;
      const {
        routeRequest, updatedRouteRequest
      } = await RoutesController.getUpdatedRouteRequest(requestId, body);
      if (routeRequest.status === 'Approved') {
        const submission = RoutesController.saveRoute(routeRequest, body);
        RoutesController.sendNotificationToProvider(requestId, submission);
      } else {
        RoutesController.sendDeclineNotificationToFellow(requestId, body.teamUrl);
      }

      return res.status(201).json({
        success: true,
        message: 'This route request has been updated',
        data: updatedRouteRequest.dataValues
      });
    } catch (error) {
      BugSnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async getUpdatedRouteRequest(requestId, body) {
    try {
      const routeRequest = await RouteRequestService.getRouteRequest(requestId);
      if (!routeRequest) {
        HttpError.throwErrorIfNull(null, 'Route request not found');
      }
      const updateData = {};
      updateData.status = body.newOpsStatus.trim().toLowerCase() === 'approve'
        ? 'Approved' : 'Declined';
      updateData.opsComment = body.comment.trim();
      const reviewer = await UserService.getUserByEmail(body.reviewerEmail);
      updateData.opsReviewerId = reviewer.dataValues.id;
      const updatedRouteRequest = await RouteRequestService.updateRouteRequest(
        requestId, updateData
      );
      return { routeRequest, updatedRouteRequest };
    } catch (error) {
      BugSnagHelper.log(error);
      return HttpError.sendErrorResponse(error);
    }
  }

  /**
   * @description creates a string from the provider object values
   * @param  {object} provider The provider object
   * @returns {string} The string containing the values from the provider object
   */
  static formatProviderDetails(provider) {
    const formattedProvider = { ...provider };
    delete formattedProvider.user;
    return Object.values(formattedProvider).toString();
  }

  /**
   * @description format updated request data to be sent to provider
   * @param  {object} routeRequest The created route request
   * @param  {object} body The request body containing update info
   * @returns {object} The submission containing route info
   */
  static saveRoute(routeRequest, body) {
    const data = {
      destinationName: routeRequest.home.dataValues.address,
      name: body.routeName.trim().toLowerCase(),
      takeOff: body.takeOff.trim(),
      provider: this.formatProviderDetails(body.provider)
    };

    const submission = {
      routeName: data.name,
      takeOffTime: data.takeOff,
      teamUrl: body.teamUrl,
      Provider: data.provider
    };

    return submission;
  }

  static async sendDeclineNotificationToFellow(requestId, teamUrl) {
    SlackEvents.raise(slackEventNames.OPERATIONS_DECLINE_ROUTE_REQUEST, requestId, '', teamUrl);
  }

  static async sendNotificationToProvider(requestId, submission) {
    const route = await RouteRequestService.getRouteRequest(requestId);
    SlackEvents.raise(
      slackEventNames.SEND_PROVIDER_APPROVED_ROUTE_REQUEST, route, '', submission
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
