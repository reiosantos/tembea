import {
  bugsnagHelper,
  Cache,
  DialogPrompts,
  GoogleMapsLocationSuggestionOptions,
  GoogleMapsPlaceDetails,
  GoogleMapsService,
  GoogleMapsStatic,
  GoogleMapsSuggestions,
  LocationPrompts,
  Marker,
  PreviewPrompts,
  RoutesHelper,
  slackEventNames,
  SlackEvents,
  SlackHelpers,
  SlackInteractiveMessage,
  UserInputValidator,
  validateBusStop,
} from './rootFile';
import RouteInputHandlerHelper from './RouteInputHandlerHelper';
import LocationMapHelper from '../../../helpers/googleMaps/locationsMapHelpers';
import { getFellowEngagementDetails } from '../helpers/formHelper';
import InteractivePromptSlackHelper from '../helpers/slackHelpers/InteractivePromptSlackHelper';
import UpdateSlackMessageHelper from '../../../helpers/slack/updatePastMessageHelper';
import { LOCATION_CORDINATES } from '../../../helpers/constants';

const RouteInputHandlers = {
  home: async (payload, respond) => {
    try {
      const { submission: { location: locationSearchString } } = payload;
      const locationPredictions = new GoogleMapsLocationSuggestionOptions(
        locationSearchString, LOCATION_CORDINATES.NAIROBI
      );

      const {
        predictions: predictedPlacesResults
      } = await GoogleMapsSuggestions.getPlacesAutoComplete(locationPredictions);

      const predictedResultsToSlackSelectAction = predictedPlacesResults.map(
        (prediction) => ({ text: prediction.description, value: prediction.place_id })
      );

      const locationMarkers = LocationMapHelper.locationMarker(predictedPlacesResults);

      const staticMapString = GoogleMapsStatic.getLocationScreenshot(locationMarkers);
      // Convert the string to a URL by removing spaces and replacing with %20

      const staticMapUrl = RouteInputHandlerHelper.convertStringToUrl(staticMapString);

      const message = LocationPrompts.sendLocationSuggestionsResponse(
        staticMapUrl, predictedResultsToSlackSelectAction
      );
      respond(message);
    } catch (error) {
      respond(InteractivePromptSlackHelper.sendError());
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

      const { geometry: { location: { lat: latitude } } } = place;
      const { geometry: { location: { lng: longitude } } } = place;
      const locationGeometry = `${latitude},${longitude}`;

      const placeDetails = await GoogleMapsPlaceDetails.getPlaceDetails(place.place_id);
      const address = `${placeDetails.result.name}, ${placeDetails.result.formatted_address}`;
      const locationMarker = new Marker('red', 'H');
      locationMarker.addLocation(locationGeometry);
      const staticMapString = GoogleMapsStatic.getLocationScreenshot([locationMarker]);
      // Convert the string to a URL by removing spaces and replacing with %20
      const staticMapUrl = RouteInputHandlerHelper.convertStringToUrl(staticMapString);
      await Cache.save(payload.user.id, 'homeAddress', { address, latitude, longitude });

      LocationPrompts
        .sendLocationConfirmationResponse(respond, staticMapUrl, address, locationGeometry);
    } catch (error) {
      InteractivePromptSlackHelper.sendError();
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

      await Cache.save(payload.user.id, 'busStageList', busStageList);
      await DialogPrompts.sendBusStopForm(payload, busStageList);
    } catch (e) {
      bugsnagHelper.log(e);
      respond(new SlackInteractiveMessage(
        'Unsuccessful request. Please Try again, Request Timed out'
      ));
    }
  },
  handleBusStopSelected: async (payload, respond) => {
    try {
      const { otherBusStop, selectBusStop } = payload.submission;
      const busStopCoordinate = selectBusStop || otherBusStop;
      const errors = validateBusStop(otherBusStop, selectBusStop);
      if (errors) return errors;

      const previewData = await RouteInputHandlerHelper.resolveDestinationPreviewData(
        payload, busStopCoordinate
      );
      const { validationError } = previewData;
      if (validationError) return validationError;

      await UpdateSlackMessageHelper.updateMessage(payload.state, { text: 'Noted...' });
      await RouteInputHandlerHelper.savePreviewDataToCache(payload.user.id, previewData);
      const previewMessage = PreviewPrompts.displayDestinationPreview(previewData);
      respond(previewMessage);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  },
  runValidations: (payload) => {
    if (payload.submission && payload.submission.coordinates) {
      const errors = [];
      errors.push(...UserInputValidator.validateCoordinates(payload));
      return errors;
    }
  },
  handleNewRouteRequest: async (payload) => {
    const { value } = payload.actions[0];
    if (value === 'launchNewRoutePrompt') {
      return DialogPrompts.sendNewRouteForm(payload);
    }
  },
  handlePreviewPartnerInfo: async (payload, respond) => {
    const { user: { id: userId }, team: { id: teamId } } = payload;
    const [requester, cached] = await Promise.all([
      SlackHelpers.findOrCreateUserBySlackId(userId, teamId),
      await Cache.fetch(userId),
      await getFellowEngagementDetails(userId, teamId)
    ]);
    const { locationInfo } = cached;
    const { submission } = payload;
    const errors = UserInputValidator.validateEngagementForm(submission);
    if (errors) return errors;

    await UpdateSlackMessageHelper.updateMessage(payload.state, { text: 'Noted...' });
    if (locationInfo) {
      const message = await PreviewPrompts.sendPartnerInfoPreview(payload, locationInfo, requester);
      respond(message);
    }
  },
  handlePartnerForm: async (payload, respond) => {
    try {
      const { team: { id: teamId } } = payload;
      const routeRequest = await RouteInputHandlerHelper.handleRouteRequestSubmission(payload);
      SlackEvents.raise(
        slackEventNames.NEW_ROUTE_REQUEST,
        respond,
        {
          routeRequestId: routeRequest.id,
          teamId
        }
      );
      respond(new SlackInteractiveMessage('Your Route Request has been successfully submitted'));
    } catch (e) {
      bugsnagHelper.log(e);
      respond(new SlackInteractiveMessage(
        'Unsuccessful request. Please Try again, Request Timed out'
      ));
    }
  }
};

export default RouteInputHandlers;
