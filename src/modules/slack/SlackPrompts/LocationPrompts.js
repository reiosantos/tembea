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
      'Select your home location', [attachment, navAttachment]
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
      'Confirm your home location', [attachment, navAttachment]
    );
    respond(message);
  }

  static sendLocationCoordinatesNotFound(respond) {
    const title = 'Coordinates you entered do not point to any location on Google maps';
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
}

export default LocationPrompts;
