import { SlackInteractiveMessage, createNavButtons } from '../RouteManagement/rootFile';
import SlackPagination from '../../../helpers/slack/SlackPaginationHelper';
import {
  SlackAttachment,
  SlackAttachmentField, SlackButtonAction
} from '../SlackModels/SlackMessageModels';

class RoutesHelpers {
  static toAvailableRoutesAttachment(allAvailableRoutes, currentPage, totalPages) {
    const attachments = [];
    if (allAvailableRoutes.length) {
      allAvailableRoutes.forEach((route) => {
        attachments.push(this.createRouteAttachment(route));
      });
    } else {
      attachments.push(new SlackInteractiveMessage(
        'Sorry! No route is available at the moment.'
      ));
    }

    if (totalPages > 1) {
      attachments.push(SlackPagination.createPaginationAttachment(
        'tembea_route', 'view_available_routes', currentPage, totalPages
      ));
    }

    const navButtonsAttachment = createNavButtons('back_to_launch', 'back_to_routes_launch');
    return new SlackInteractiveMessage(
      '*All Available Routes:slightly_smiling_face:*', [...attachments, navButtonsAttachment]
    );
  }

  static createRouteAttachment(routesInfo) {
    const {
      id: routeId, takeOff: departureTime, driverName, batch, capacity, name: routeName, inUse: passenger
    } = routesInfo;
    const attachment = new SlackAttachment();
    const route = `Route: ${routeName}`;
    const takeOffTime = `Departure Time:  ${departureTime}`;
    const availablePassenger = `Available Passengers: ${passenger} `;
    const cabCapacity = `Cab Capacity: ${capacity} `;
    const RouteDriverName = `Driver Name: ${driverName} `;
    const cabBatch = `Batch: ${batch} `;

    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(route, takeOffTime)]);
    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(cabBatch, RouteDriverName)]);
    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(availablePassenger, cabCapacity)]);
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('joinRoute', 'Join Route', routeId)
    ]);
    attachment.addOptionalProps('join_route_actions');
    return attachment;
  }
}

export default RoutesHelpers;
