import RouteRequestService from '../../services/RouteRequestService';

class RouteController {
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

export default RouteController;
