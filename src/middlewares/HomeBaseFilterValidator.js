import Response from '../helpers/responseHelper';

class HomeBaseFilterValidator {
  static async validateHomeBaseAccess(req, res, next) {
    const { headers: { homebaseid }, currentUser: { userInfo: { locations } } } = req;
    if (!homebaseid) {
      return Response.sendResponse(res, 400, false,
        'Missing HomebaseId in request headers');
    }
    const [canViewLocationData] = locations.filter(
      (location) => location.id === parseInt(homebaseid, 10)
    );
    if (!canViewLocationData) {
      return Response.sendResponse(res, 403, false,
        'You dont have permissions to view this location data');
    }
    return next();
  }
}

export default HomeBaseFilterValidator;
