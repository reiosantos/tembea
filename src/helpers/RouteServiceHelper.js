
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
}
