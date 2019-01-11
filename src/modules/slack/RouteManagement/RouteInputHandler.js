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
import validateBusStop from '../../../helpers/googleMaps/busStopValidation';
import LocationPrompts from '../SlackPrompts/LocationPrompts';

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

      LocationPrompts.sendLocationSuggestionsResponse(
        respond, staticMapUrl, predictedResultsToSlackSelectAction
      );
    } catch (error) {
      InteractivePrompts.sendError();
      bugsnagHelper.log(error);
    }
  },
  suggestions: async (payload, respond) => {
    try {
      RouteInputHandlers.locationNotFound(payload, respond);

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

      Cache.saveObject(payload.user.id, { address, latitude, longitude });

      LocationPrompts
        .sendLocationConfirmationResponse(respond, staticMapUrl, address, locationGeometry);
    } catch (error) {
      InteractivePrompts.sendError();
      bugsnagHelper.log(error);
    }
  },
  locationNotFound: (payload, respond) => {
    if (payload.actions && payload.actions[0].value === 'no') {
      respond(new SlackInteractiveMessage('Noted...'));
      return DialogPrompts.sendLocationCoordinatesForm(payload);
    }
  },
  handleBusStopRoute: async (payload, respond) => {
    try {
      const { value: location } = payload.actions[0];

      const maps = new GoogleMapsService();
      const result = await maps.findNearestBusStops(location);
      const busStageList = GoogleMapsService.mapResultsToCoordinates(result);

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

    // do operations to save selected place


    const res = await GoogleMapsStatic.getPathFromDojoToDropOff(busStopCoordinate);
    respond(new SlackInteractiveMessage('Noted...'));
    return res;
  },

  runValidations: (payload) => {
    if (payload.submission && payload.submission.coordinates) {
      const errors = [];
      errors.push(...UserInputValidator.validateCoordinates(payload));
      return errors;
    }
  }
};

export default RouteInputHandlers;
