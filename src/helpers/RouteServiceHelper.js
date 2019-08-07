
export default class RouteServiceHelper {
  static isCabFields(predicate) {
    return predicate === 'driverName' || predicate === 'driverPhoneNo' || predicate === 'regNumber';
  }

  static serializeRider(rider) {
    if (!rider) return {};
    const { slackId, id, email } = rider;
    return { slackId, id, email };
  }

  static serializeRiders(data) {
    if (!data) return {};
    const riders = data.map(RouteServiceHelper.serializeRider);
    const inUse = riders.length;
    return { inUse, riders };
  }

  static serializeRoute(route) {
    if (!route) return {};
    const { name, destination: { address: destination } } = route;
    return { name, destination };
  }

  static serializeCabDetails(cabDetails) {
    if (cabDetails) {
      const { driverName, driverPhoneNo, regNumber } = cabDetails;
      return { driverName, driverPhoneNo, regNumber };
    }
    return {};
  }

  static canJoinRoute(route) {
    return route.riders && route.riders.length < route.capacity;
  }

  /**
   * Extracts required fields for a complete route/batch resource
   *
   * @static
   * @param {*} routeData - The route/batch resource
   * @returns {{
   *  regNumber:string, takeOff:string, driverPhoneNo:string, inUse:string, name: string,
   *  destination:string, batch:string, driverName:string, id:number, status:string,
   *  capacity:number, riders: Array<{email:string,slackId:string,id:number}>
   * }}
   * @memberof RouteServiceHelper
   */
  static serializeRouteBatch(routeData) {
    const {
      id, status, takeOff, capacity, batch, comments, inUse, imageUrl, routeId, homebase
    } = routeData;
    return {
      id,
      status,
      imageUrl,
      takeOff,
      capacity,
      batch,
      comments,
      routeId,
      homebase,
      inUse: inUse || 0,
      ...RouteServiceHelper.serializeRoute(routeData.route),
      ...RouteServiceHelper.serializeCabDetails(routeData.cabDetails),
      ...RouteServiceHelper.serializeRiders(routeData.riders),
    };
  }
}
