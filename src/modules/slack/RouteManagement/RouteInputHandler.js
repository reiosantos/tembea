import {
  GoogleMapsLocationSuggestionOptions,
  Marker,
  RoutesHelper
} from '../../../helpers/googleMaps/googleMapsHelpers';
import GoogleMapsSuggestions from '../../../services/googleMaps/GoogleMapsSuggestions';
import GoogleMapsStatic from '../../../services/googleMaps/GoogleMapsStatic';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import GoogleMapsPlaceDetails from '../../../services/googleMaps/GoogleMapsPlaceDetails';
import Cache from '../../../cache';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import GoogleMapsService from '../../../services/googleMaps';
import RouteRequestService from '../../../services/RouteRequestService';
import PartnerService from '../../../services/PartnerService';
import validateBusStop from '../../../helpers/googleMaps/busStopValidation';
import LocationPrompts from '../SlackPrompts/LocationPrompts';
import AddressService from '../../../services/AddressService';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import { slackEventNames, SlackEvents } from '../events/slackEvents';
import createNavButtons from '../../../helpers/slack/navButtons';

const getLongLat = (coordinate) => {
  const [latitude, longitude] = coordinate.split(',');
  return { latitude, longitude };
};

const getBusStopDetailsFromCache = async (payload, busStopCoordinate) => {
  const { busStageList } = await Cache.fetch(payload.user.id);
  const busStopMatch = busStageList
    .filter(item => item.value === busStopCoordinate)
    .map((item) => {
      const { value: coordinate, text: address } = item;
      return { address, ...getLongLat(coordinate) };
    });
  if (busStopMatch.length) {
    return busStopMatch[0];
  }
  return null;
};

const resolveRouteRequestDep = async (payload) => {
  const { user: { id: userId }, team: { id: teamId }, submission } = payload;
  const {
    partnerName, engagementEndDate, engagementStartDate, managerId: managerSlackId, workHours
  } = submission;
  const data = await Cache.fetch(userId);
  const [partner, manager, requester, busStop, homeAddress] = await Promise.all([
    PartnerService.findOrCreatePartner(partnerName),
    SlackHelpers.findOrCreateUserBySlackId(managerSlackId, teamId),
    SlackHelpers.findOrCreateUserBySlackId(userId, teamId),
    AddressService.createNewAddress(
      data.busStop.longitude, data.busStop.latitude, data.busStop.address
    ),
    AddressService.createNewAddress(
      data.homeAddress.longitude, data.homeAddress.latitude, data.homeAddress.address
    )
  ]);

  const engagement = await PartnerService.findOrCreateEngagement(
    engagementStartDate, engagementEndDate, workHours, requester, partner
  );
  return {
    manager, busStop, homeAddress, engagement
  };
};

const createRouteRequest = async (payload) => {
  const {
    manager, busStop, homeAddress, engagement
  } = await resolveRouteRequestDep(payload);
  const { distance, busStopDistance } = payload.submission;

  const routeImageUrl = 'https://s3-us-west-2.amazonaws.com/uw-s3-cdn/wp-content/uploads/sites'
    + '/6/2017/01/04143600/Access-Map-screenshot1.jpg';
  const engagementId = engagement.id;
  const managerId = manager.id;
  const homeId = homeAddress.id;
  const busStopId = busStop.id;
  return RouteRequestService.createRoute({
    engagementId,
    managerId,
    homeId,
    busStopId,
    routeImageUrl,
    distance,
    busStopDistance
  });
};

const mockPayloadData = payload => ({
  ...payload,
  submission: {
    partnerName: 'Rancho Enterprise',
    managerId: 'UERPGB28P',
    workHours: '20:30-02:30',
    distance: 2.2,
    busStopDistance: 1.7,
  }
});

const RouteInputHandlers = {
  home: async (payload, respond) => {
    try {
      const locationSearchString = payload.submission.location;
      const locationPredictions = new GoogleMapsLocationSuggestionOptions(locationSearchString);

      const response = await GoogleMapsSuggestions.getPlacesAutoComplete(locationPredictions);
      const predictedResults = response.predictions;
      const predictedResultsToSlackSelectAction = predictedResults.map(
        prediction => ({ text: prediction.description, value: prediction.place_id })
      );

      let markerLabel = 0;
      const locationMarkers = predictedResults.map((prediction) => {
        const locationMarker = new Marker('blue', markerLabel += 1);
        locationMarker.addLocation(prediction.description);
        return locationMarker;
      });
      const staticMapString = GoogleMapsStatic.getLocationScreenShotUrl(locationMarkers);
      // Convert the string to a URL by removing spaces and replacing with %20
      const staticMapUrl = staticMapString.replace(/\s/g, '%20');

      const message = LocationPrompts.sendLocationSuggestionsResponse(
        respond, staticMapUrl, predictedResultsToSlackSelectAction
      );
      respond(message);
    } catch (error) {
      respond(InteractivePrompts.sendError());
      bugsnagHelper.log(error);
    }
  },

  suggestions: async (payload, respond) => {
    try {
      const place = await RoutesHelper.getReverseGeocodePayload(payload);
      if (!place) {
        // inform user if coordinates did not point to a location
        LocationPrompts.sendLocationCoordinatesNotFound(respond);
        return;
      }

      const latitude = place.geometry.location.lat;
      const longitude = place.geometry.location.lng;
      const locationGeometry = `${latitude},${longitude}`;

      const placeDetails = await GoogleMapsPlaceDetails.getPlaceDetails(place.place_id);
      const address = `${placeDetails.result.name}, ${placeDetails.result.formatted_address}`;
      const locationMarker = new Marker('red', 'H');
      locationMarker.addLocation(locationGeometry);
      const staticMapString = GoogleMapsStatic.getLocationScreenShotUrl([locationMarker]);
      // Convert the string to a URL by removing spaces and replacing with %20
      const staticMapUrl = staticMapString.replace(/\s/g, '%20');

      Cache.save(payload.user.id, 'homeAddress', { address, latitude, longitude });

      LocationPrompts
        .sendLocationConfirmationResponse(respond, staticMapUrl, address, locationGeometry);
    } catch (error) {
      InteractivePrompts.sendError();
      bugsnagHelper.log(error);
    }
  },
  locationNotFound: (payload, respond) => {
    const { value } = payload.actions[0];
    if (value === 'no') {
      respond(new SlackInteractiveMessage('Noted...'));
      return DialogPrompts.sendLocationCoordinatesForm(payload);
    }

    if (value === 'retry') {
      respond(new SlackInteractiveMessage('Noted...'));
      return DialogPrompts.sendLocationForm(payload);
    }
  },
  handleBusStopRoute: async (payload, respond) => {
    try {
      const { value: location } = payload.actions[0];

      const maps = new GoogleMapsService();
      const result = await maps.findNearestBusStops(location);
      const busStageList = GoogleMapsService.mapResultsToCoordinates(result);
      Cache.save(payload.user.id, 'busStageList', busStageList);
      respond(new SlackInteractiveMessage('Noted...'));
      await DialogPrompts.sendBusStopForm(payload, busStageList);
    } catch (e) {
      bugsnagHelper.log(e);
      respond(new SlackInteractiveMessage(
        'Unsuccessful request. Please Try again, Request Timed out'
      ));
    }
  },
  handleBusStopSelected: async (payload, respond) => {
    const { otherBusStop, selectBusStop } = payload.submission;
    const busStopCoordinate = selectBusStop || otherBusStop;
    const errors = validateBusStop(otherBusStop, selectBusStop);
    if (errors) return errors;
    // eslint-disable-next-line no-unused-vars
    const res = await GoogleMapsStatic.getPathFromDojoToDropOff(busStopCoordinate);

    let busStop = await getBusStopDetailsFromCache(payload, busStopCoordinate);
    if (!busStop) {
      busStop = { address: '', ...getLongLat(busStopCoordinate) };
    }
    await Cache.save(payload.user.id, 'busStop', busStop);
    // todo send form for user to input partner information
    const mockPayload = mockPayloadData(payload);
    // todo change this with the proper implementation.
    RouteInputHandlers.handlePartnerForm(mockPayload, respond);
    const navAttachment = createNavButtons('back_to_launch', 'back_to_routes_launch');
    const message = new SlackInteractiveMessage(
      ':sweat_smile: Your request has been submitted.',
      [navAttachment]
    );
    respond(message);
  },
  runValidations: (payload) => {
    if (payload.submission && payload.submission.coordinates) {
      const errors = [];
      errors.push(...UserInputValidator.validateCoordinates(payload));
      return errors;
    }
  },
  handlePartnerForm: async (payload, respond) => {
    // todo validate input
    try {
      const { team: { id: teamId } } = payload;
      const routeRequest = await createRouteRequest(payload);

      SlackEvents.raise(
        slackEventNames.NEW_ROUTE_REQUEST,
        respond,
        {
          routeRequestId: routeRequest.id,
          teamId
        }
      );
    } catch (e) {
      bugsnagHelper.log(e);
    }
    Cache.delete(payload.user.id);
  }
};

export default RouteInputHandlers;
