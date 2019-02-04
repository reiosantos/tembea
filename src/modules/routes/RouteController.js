import HttpError from '../../helpers/errorHandler';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import RouteService from '../../services/RouteService';
import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import { RoutesHelper } from '../../helpers/googleMaps/googleMapsHelpers';
import { GoogleMapsPlaceDetails } from '../slack/RouteManagement/rootFile';
import AddressService from '../../services/AddressService';
import RouteRequestService from '../../services/RouteRequestService';

class RoutesController {
  /**
   * @description Read the routes batch records
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async getRoutes(req, res) {
    try {
      let { page, size, sort } = req.query;
      page = page || 1;
      size = size || defaultSize;
      sort = SequelizePaginationHelper.deserializeSort(sort || 'name,asc,id,asc');
      const pageable = { page, size, sort };
      const { totalPages, routes, pageNo } = await RouteService.getRoutes(pageable);

      const message = `${pageNo} of ${totalPages} page(s).`;

      const pageData = {
        pageMeta: {
          totalPages,
          page: pageNo,
          totalResults: routes.length,
          pageSize: parseInt(size, 10),
        },
        routes
      };
      return Response.sendResponse(res, 200, true, message, pageData);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async createRoute(req, res) {
    try {
      const {
        routeName, destinationCoordinates, vehicleRegNumber, takeOffTime, capacity
      } = req.body;

      const destination = await RoutesController.saveDestination(destinationCoordinates);

      const data = {
        name: routeName,
        vehicleRegNumber,
        destinationName: destination.address,
        capacity,
        takeOff: takeOffTime,
      };
      const routeInfo = await RouteService.createRouteBatch(data);
      res.status(200).json(routeInfo);
    } catch (error) {
      bugsnagHelper.log(error);
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

    const placeDetails = await GoogleMapsPlaceDetails.getPlaceDetails(place.place_id);
    address = `${placeDetails.result.name}, ${placeDetails.result.formatted_address}`;
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

  static getOne() {
    // TODO return a single route request
  }
}

export default RoutesController;
