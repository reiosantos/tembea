import {
  GoogleMapsLocationSuggestionOptions,
  Marker, RoutesHelper
} from './googleMapsHelpers';
import GoogleMapsSuggestions from '../../services/googleMaps/GoogleMapsSuggestions';
import GoogleMapsStatic from '../../services/googleMaps/GoogleMapsStatic';
import GoogleMapsPlaceDetails from '../../services/googleMaps/GoogleMapsPlaceDetails';

import Cache from '../../cache';
import LocationPrompts from '../../modules/slack/SlackPrompts/LocationPrompts';
import InteractivePrompts from '../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../modules/slack/SlackPrompts/DialogPrompts';
import bugsnagHelper from '../bugsnagHelper';
import { SlackInteractiveMessage } from '../../modules/slack/SlackModels/SlackMessageModels';

export default class LocationHelpers {
  static convertStringToUrl(string) {
    return string.replace(/\s/g, '%20');
  }

  static tripCompare(tripDetails) {
    const tripData = tripDetails;
    const {
      destination, othersDestination, pickup, othersPickup
    } = tripDetails;
    tripData.destination = destination === 'Others' ? othersDestination : destination;
    tripData.pickup = pickup === 'Others' ? othersPickup : pickup;
    return tripData;
  }

  static checkTripType(string, payload) {
    let locationSearchString;
    const {
      submission: {
        pickup, othersPickup, destination, othersDestination
      }
    } = payload;
    if (string === 'pickup') {
      locationSearchString = this.getLocation(pickup, othersPickup);
    } else {
      locationSearchString = this.getLocation(destination, othersDestination);
    }
    return locationSearchString;
  }

  static getLocation(searchstring, other) {
    if (searchstring === 'Others') {
      return other;
    }
    return searchstring;
  }
  
  static locationMarker(predictedPlacesResults) {
    let markerLabel = 0;
    return predictedPlacesResults.map((prediction) => {
      const locationMarker = new Marker('blue', markerLabel += 1);
      locationMarker.addLocation(prediction.description);
      return locationMarker;
    });
  }

  static async locationVerify(payload, respond, buttonType, tripType) {
    const locationSearchString = this.checkTripType(buttonType, payload);
    try {
      const locationPredictions = new GoogleMapsLocationSuggestionOptions(locationSearchString);
    
      const { predictions: predictedPlacesResults } = await GoogleMapsSuggestions
        .getPlacesAutoComplete(locationPredictions);
    
      const predictedLocations = predictedPlacesResults.map(
        prediction => ({ text: prediction.description, value: prediction.place_id })
      );
    
      const locationMarkers = this.locationMarker(predictedPlacesResults);
    
      const staticMapString = GoogleMapsStatic.getLocationScreenShotUrl(locationMarkers);
      const staticMapUrl = this.convertStringToUrl(staticMapString);
      const pickupOrDestination = buttonType === 'pickup' ? 'Pick up' : 'Destination';

      const locationData = {
        staticMapUrl, predictedLocations, pickupOrDestination, buttonType, tripType
      };

      const message = LocationPrompts.sendMapSuggestionsResponse(locationData);
      respond(message);
    } catch (error) {
      respond(InteractivePrompts.sendError());
      bugsnagHelper.log(error);
    }
  }

  static locationPrompt(locationData, respond, payload, stateLocation, trip) {
    const {
      address, latitude, longitude
    } = locationData;
    Cache.save(payload.user.id, stateLocation, { address, latitude, longitude });
    LocationPrompts.sendMapsConfirmationResponse(respond, locationData, trip);
  }

  static sendResponse(actionName, locationData, respond, payload) {
    if (actionName === 'pickupBtn') {
      LocationHelpers.locationPrompt(locationData, respond, payload, 'pickUpAddress', 'pickup');
    } else {
      LocationHelpers.locationPrompt(locationData,
        respond, payload, 'destinationAddress', 'destination');
    }
  }

  static async locationSuggestions(payload, respond, actionName, actionType) {
    try {
      const place = await RoutesHelper.getReverseGeocodePayload(payload);
      if (!place) {
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
      const staticMapString = GoogleMapsStatic.getLocationScreenShotUrl([locationMarker]);
      const staticMapUrl = this.convertStringToUrl(staticMapString);
      const locationData = {
        staticMapUrl, address, latitude, longitude, locationGeometry, actionType
      };
      await LocationHelpers.sendResponse(actionName, locationData, respond, payload);
    } catch (error) {
      InteractivePrompts.sendError();
      bugsnagHelper.log(error);
    }
  }

  static async callDestinationSelection(payload, respond) {
    try {
      const { user: { id } } = payload;
      const { tripType } = await Cache.fetch(id);

      if (tripType === 'Airport Transfer') {
        respond(
          new SlackInteractiveMessage('Noted ...')
        );
        return DialogPrompts.sendTripDetailsForm(
          payload, 'travelDestinationForm',
          'travel_trip_destinationConfirmation', 'Destination Details'
        );
      }
      respond(
        new SlackInteractiveMessage('We could not process that request. Please try again')
      );
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}
