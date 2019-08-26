import {
  SlackInteractiveMessage,
  createNavButtons,
  createSearchButton
} from '../RouteManagement/rootFile';
import SlackPagination from '../../../helpers/slack/SlackPaginationHelper';
import {
  SlackAttachment,
  SlackAttachmentField, SlackButtonAction, SlackCancelButtonAction
} from '../SlackModels/SlackMessageModels';
import ProviderAttachmentHelper from '../SlackPrompts/notifications/ProviderNotifications/helper';


class RoutesHelpers {
  static toAvailableRoutesAttachment(allAvailableRoutes, currentPage, totalPages, isSearch = false) {
    const attachments = [];
    if (allAvailableRoutes.length) {
      allAvailableRoutes.forEach((route) => {
        attachments.push(this.createRouteAttachment(route));
      });
    } else {
      attachments.push(new SlackInteractiveMessage(
        'Sorry, route not available at the moment :disappointed:'
      ));
    }

    if (totalPages > 1) {
      attachments.push(SlackPagination.createPaginationAttachment(
        'tembea_route', 'view_available_routes', currentPage, totalPages
      ));
    }

    const navButtonsAttachment = createNavButtons('back_to_launch', 'back_to_routes_launch');
    const searchButtonAttachment = createSearchButton('tembea_route', 'view_available_routes');
    const allRoutesButtonAttachment = isSearch && new SlackButtonAction(
      'See Available Routes', 'See All Available Routes', 'view_available_routes', '#FFCCAA'
    );
    searchButtonAttachment.addFieldsOrActions('actions', [allRoutesButtonAttachment]);
    attachments.push(searchButtonAttachment);
    return new SlackInteractiveMessage(
      '*All Available Routes:slightly_smiling_face:*', [...attachments, navButtonsAttachment]
    );
  }

  static createLeaveRouteButton() {
    return new SlackCancelButtonAction('Leave Route', 'leave_route',
      'Are you sure you want to leave this route', 'leave_route');
  }

  static toCurrentRouteAttachment(route) {
    const attachments = new SlackAttachment();
    const leaveRouteButton = route ? RoutesHelpers.createLeaveRouteButton(route.id) : null;
    const navButtonsAttachment = createNavButtons('back_to_launch', 'back_to_routes_launch', leaveRouteButton);

    if (!route) {
      return new SlackInteractiveMessage(
        'You are not currently on any route :disappointed:', [navButtonsAttachment]
      );
    }

    [
      ProviderAttachmentHelper.providerRouteFields(route),
      ProviderAttachmentHelper.cabFields(route.cabDetails),
      ProviderAttachmentHelper.driverFields(route.driver)
    ].map((field) => attachments.addFieldsOrActions('fields', field));


    return new SlackInteractiveMessage(
      '*My Current Route :slightly_smiling_face:*', [attachments, navButtonsAttachment]
    );
  }

  static createRouteAttachment(routesInfo) {
    const {
      id: routeId, takeOff: departureTime, regNumber, batch, capacity, name: routeName, inUse: passenger
    } = routesInfo;
    
    const attachment = new SlackAttachment();
    const route = `Route: ${routeName}`;
    const takeOffTime = `Departure Time:  ${departureTime}`;
    const availablePassenger = `Available Passengers: ${passenger} `;
    const cabCapacity = `Cab Capacity: ${capacity !== null ? capacity : 'any'} `;
    const routeDriverName = `Cab Registration Number: ${regNumber !== undefined ? regNumber : 'any'} `;
    const cabBatch = `Batch: ${batch} `;

    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(route, takeOffTime)]);
    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(cabBatch, routeDriverName)]);
    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(availablePassenger, cabCapacity)]);
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('joinRoute', 'Join Route', routeId)
    ]);
    attachment.addOptionalProps('join_route_actions');
    return attachment;
  }
}

export default RoutesHelpers;
