import {
  AddressService,
  Cache,
  GoogleMapsDistanceMatrix,
  GoogleMapsStatic,
  PartnerService,
  RouteRequestService,
  RoutesHelper,
  SlackHelpers
} from './rootFile';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';

export default class RouteInputHandlerHelper {
  static async saveRouteRequestDependencies(userId, teamId, submissionValues) {
    const {
      busStop: { longitude: busStopLng, latitude: busStopLat, address: busStopAddress },
      homeAddress: { longitude: homeLng, latitude: homeLat, address: homeAdd },
    } = await Cache.fetch(userId);
    const {
      submission: { manager: managerSlackId, nameOfPartner: partnerName, workingHours }
    } = submissionValues;

    const [partner, manager, requester, fellowBusStop, fellowHomeAddress] = await Promise.all([
      PartnerService.findOrCreatePartner(partnerName),
      SlackHelpers.findOrCreateUserBySlackId(managerSlackId, teamId),
      SlackHelpers.findOrCreateUserBySlackId(userId, teamId),
      AddressService.createNewAddress(busStopLng, busStopLat, busStopAddress),
      AddressService.createNewAddress(homeLng, homeLat, homeAdd)
    ]);
    const engagement = await PartnerService.findOrCreateEngagement(
      workingHours, requester, partner
    );
    return {
      engagement, manager, fellowBusStop, fellowHomeAddress
    };
  }

  static resolveRouteRequestDBData(locationInfo, depData) {
    const { dojoToDropOffDistance, homeToDropOffDistance, staticMapUrl } = locationInfo;
    const {
      engagement, manager, fellowBusStop, fellowHomeAddress
    } = depData;

    const engagementId = engagement.id;
    const managerId = manager.id;
    const homeId = fellowHomeAddress.id;
    const busStopId = fellowBusStop.id;
    const routeImageUrl = staticMapUrl;
    let { distanceInMetres: distance } = dojoToDropOffDistance;
    let { distanceInMetres: busStopDistance } = homeToDropOffDistance;
    distance /= 1000;
    busStopDistance /= 1000;
    return {
      engagementId,
      managerId,
      homeId,
      busStopId,
      routeImageUrl,
      distance,
      busStopDistance
    };
  }

  static async handleRouteRequestSubmission(payload) {
    const { user: { id: userId }, team: { id: teamId }, actions } = payload;
    const { value } = actions[0];
    const submissionValues = JSON.parse(value);
    const [depData, cachedData] = await Promise.all([
      RouteInputHandlerHelper.saveRouteRequestDependencies(userId, teamId, submissionValues),
      Cache.fetch(userId)
    ]);
    const { locationInfo } = cachedData;
    const dbData = RouteInputHandlerHelper.resolveRouteRequestDBData(locationInfo, depData);

    return RouteRequestService.createRoute(dbData);
  }

  static async calculateDistance(savedBusStop, savedHomeAddress, theDojo) {
    const { latitude: busStopLat, longitude: busStopLong } = savedBusStop;
    const { latitude: homeLat, longitude: homeLong } = savedHomeAddress;
    const { dataValues: { location: { latitude, longitude } } } = theDojo;
    const dojoLocation = `${latitude}, ${longitude}`;
    const homeLocation = `${homeLat}, ${homeLong}`;
    const busStopLocation = `${busStopLat}, ${busStopLong}`;

    const [homeToDropOffDistance, dojoToDropOffDistance] = await Promise.all([
      GoogleMapsDistanceMatrix
        .calculateDistance(busStopLocation, homeLocation),
      GoogleMapsDistanceMatrix
        .calculateDistance(dojoLocation, busStopLocation)]);
    const validationError = RouteInputHandlerHelper.validateDistance(homeToDropOffDistance);
    return { homeToDropOffDistance, dojoToDropOffDistance, validationError };
  }

  static validateDistance(homeToDropOffDistance) {
    const errors = [];
    if (!homeToDropOffDistance) {
      errors.push(new SlackDialogError('selectBusStop', 'Unable to calculate distance'));
    }
    // const { distanceInMetres } = homeToDropOffDistance;
    // if (distanceInMetres > 2000) {
    //   errors.push(
    //     new SlackDialogError('selectBusStop', 'Selected bus stop is more than 2km from home')
    //   );
    // }
    let validationError;
    if (errors.length > 0) {
      validationError = {
        errors
      };
    }
    return validationError;
  }

  static getLongLat(coordinate) {
    const [latitude, longitude] = coordinate.split(',');
    return {
      latitude,
      longitude
    };
  }

  static convertStringToUrl(string) {
    return string.replace(/\s/g, '%20');
  }

  static async getLocationDetailsFromCache(payload, key, coordinateValue = null) {
    const locationResult = (await Cache.fetch(payload.user.id))[`${key}`];
    if (coordinateValue) {
      const locationMatch = locationResult.filter(item => item.value === coordinateValue)
        .map((item) => {
          const { value: coordinate, text: address } = item;
          return { address, ...RouteInputHandlerHelper.getLongLat(coordinate) };
        });
      if (locationMatch.length) {
        return locationMatch[0];
      }
      return null;
    }
    return locationResult;
  }

  static async resolveDestinationPreviewData(payload, busStopCoordinate) {
    const [staticMapString, savedHomeAddress, savedBusStop, theDojo] = await Promise.all([
      GoogleMapsStatic.getPathFromDojoToDropOff(busStopCoordinate),
      RouteInputHandlerHelper.getLocationDetailsFromCache(payload, 'homeAddress'),
      RouteInputHandlerHelper.getLocationDetailsFromCache(
        payload, 'busStageList', busStopCoordinate
      ),
      RoutesHelper.getDojoCoordinateFromDb()
    ]);

    const {
      homeToDropOffDistance, dojoToDropOffDistance, validationError
    } = await RouteInputHandlerHelper.calculateDistance(savedBusStop, savedHomeAddress, theDojo);

    const staticMapUrl = RouteInputHandlerHelper.convertStringToUrl(staticMapString);
    return {
      staticMapUrl,
      homeToDropOffDistance,
      dojoToDropOffDistance,
      validationError,
      savedBusStop,
      savedHomeAddress,
    };
  }

  static async savePreviewDataToCache(key, previewData) {
    const {
      staticMapUrl, homeToDropOffDistance,
      dojoToDropOffDistance, savedBusStop, savedHomeAddress,
    } = previewData;
    const locationInfo = {
      dojoToDropOffDistance,
      homeToDropOffDistance,
      staticMapUrl,
      savedHomeAddress,
      savedBusStop
    };
    await Cache.save(key, 'busStop', savedBusStop);
    await Cache.save(key, 'locationInfo', locationInfo);
  }
}
