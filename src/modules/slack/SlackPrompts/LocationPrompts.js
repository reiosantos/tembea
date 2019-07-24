import createNavButtons from '../../../helpers/slack/navButtons';
import {
  SlackAttachment,
  SlackButtonAction, SlackInteractiveMessage,
  SlackSelectAction,
} from '../SlackModels/SlackMessageModels';

class LocationPrompts {
  static sendLocationSuggestionsResponse(staticMapUrl, predictedLocations) {
    const title = predictedLocations.length
      ? 'Locations on the map are marked in the order they appear on the list'
      : 'The location you searched for is not in the acceptable radius :disappointed:';

    const attachment = new SlackAttachment('', title, '', '',
      predictedLocations.length ? staticMapUrl : '');

    attachment.addFieldsOrActions('actions', [
      predictedLocations.length
        ? new SlackSelectAction('predictedLocations', 'Select Home location', predictedLocations)
        : new SlackButtonAction('retry', 'Try Again', 'retry'),
      new SlackButtonAction('no',
        predictedLocations.length ? 'Location not listed' : 'Enter Location Coordinates', 'no')]);

    attachment.addOptionalProps(predictedLocations.length
      ? 'new_route_suggestions' : 'new_route_locationNotFound', '', '#3AAF85');

    const navAttachment = createNavButtons('back_to_launch', 'back_to_routes_launch');

    return new SlackInteractiveMessage(
      '*Select Home location*', [attachment, navAttachment]
    );
  }

  static sendMapSuggestionsResponse(locationData) {
    const {
      staticMapUrl, predictedLocations, pickupOrDestination, buttonType, tripType
    } = locationData;

    const errorMessage = 'Sorry, we could not find the location you entered :disappointed:. '
     + `However, :smiley: you may proceed to enter the same ${pickupOrDestination} location details`
     + ' and book the trip by pressing the button below';
    const title = 'Locations on the map are marked in the order they appear on the list';

    const attachment = new SlackAttachment('', predictedLocations.length ? title : errorMessage,
      '', '',
      predictedLocations.length ? staticMapUrl : '');

    const button = new SlackButtonAction('no', 'Location not listed', `no_${pickupOrDestination}`);
    const dropdown = new SlackSelectAction(`${buttonType}Btn`,
      `${pickupOrDestination} location`, predictedLocations);
    attachment.addFieldsOrActions('actions', predictedLocations.length ? [dropdown] : [button]);

    attachment.addOptionalProps(predictedLocations.length
      ? `${tripType}_suggestions` : `${tripType}_locationNotFound`, '',
    '#3AAF85', 'default', buttonType);

    return new SlackInteractiveMessage(
      `*Select your ${pickupOrDestination} location*`, [attachment]
    );
  }

  static errorPromptMessage(respond) {
    respond(
      new SlackInteractiveMessage(
        'Sorry, we could not find the location. :disappointed: Contact support for assistance.'
      )
    );
  }

  static sendLocationConfirmationResponse(respond, staticMapUrl, locationName, locationGeometry) {
    const attachment = new SlackAttachment(
      '', locationName, '', '', staticMapUrl
    );

    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('confirmHome', 'Confirm home location', locationGeometry)]);

    attachment.addOptionalProps('new_route_handleBusStopRoute');

    const navAttachment = createNavButtons('back_to_launch', 'back_to_routes_launch');

    const message = new SlackInteractiveMessage(
      '*Confirm your home location*', [attachment, navAttachment]
    );
    respond(message);
  }

  static sendMapsConfirmationResponse(respond, locationData, trip) {
    const {
      staticMapUrl, address, locationGeometry, actionType
    } = locationData;
    const attachment = new SlackAttachment(
      '', address, '', '', staticMapUrl
    );
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction(`confirm${trip}`, `Confirm ${trip} location`, locationGeometry)]);

    let message;
    if (trip === 'pickup') {
      attachment.addOptionalProps(`${actionType}_destinationSelection`);
      message = new SlackInteractiveMessage(
        'Confirm your pickup location', [attachment]
      );
    } else {
      attachment.addOptionalProps(`${actionType}_detailsConfirmation`);
      message = new SlackInteractiveMessage(
        'Confirm your Destination location', [attachment]
      );
    }
    respond(message);
  }

  static sendLocationCoordinatesNotFound(respond) {
    const title = 'The coordinates you entered do not point to any location on Google maps';
    const attachment = new SlackAttachment('', title);

    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('no', 'Re-enter Coordinates', 'no')
    ]);

    attachment.addOptionalProps('new_route_locationNotFound', '', '#CD0000');

    const navAttachment = createNavButtons('back_to_routes_launch', 'back_to_routes_launch');

    const message = new SlackInteractiveMessage(
      'Select your home location', [attachment, navAttachment]
    );
    respond(message);
  }

  static sendTripSuggestionsResponse(staticMapUrl, predictedLocations, locationType, buttonValue) {
    const title = 'Locations on the map are marked in the order they appear on the list';
    const attachment = new SlackAttachment('', title, '', '',
      predictedLocations.length ? staticMapUrl : '');

    attachment.addFieldsOrActions('actions', [
      new SlackSelectAction(`${buttonValue}Btn`, `${locationType} location`, predictedLocations),
      new SlackButtonAction('no', 'Location not listed', 'no')
    ]);

    attachment.addOptionalProps(predictedLocations.length
      ? 'schedule_trip_tripSuggestions'
      : 'schedule_trip_locationNotFound', '', '#3AAF85', 'default', buttonValue);

    return new SlackInteractiveMessage(
      `Select your ${locationType} location`, [attachment]
    );
  }

  static sendTravelConfirmationResponse(respond, staticMapUrl, locationName,
    locationGeometry, type) {
    const attachment = new SlackAttachment(
      '', locationName, '', '', staticMapUrl
    );
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction(`confirm${type}`, `Confirm ${type} location`, locationGeometry)
    ]);
    let message;
    if (type === 'pickup') {
      attachment.addOptionalProps('schedule_trip_destinationSelection');
      message = new SlackInteractiveMessage(
        'Confirm your pickup location', [attachment]
      );
    } else {
      attachment.addOptionalProps('schedule_trip_detailsConfirmation');
      message = new SlackInteractiveMessage(
        'Confirm your Destination location', [attachment]
      );
    }
    respond(message);
  }
}

export default LocationPrompts;
