import handleActions from '../../SlackInteractions/SlackInteractionsHelper';
import {
  getPageNumber,
  triggerPage
} from '../../TripManagement/TripItineraryController';
import SequelizePaginationHelper from '../../../../helpers/sequelizePaginationHelper';
import RoutesHelpers from '../../helpers/routesHelper';
import { SLACK_DEFAULT_SIZE } from '../../../../helpers/constants';
import RouteService from '../../../../services/RouteService';
import JoinRouteInputHandlers from './JoinRouteInputHandler';
import { bugsnagHelper, DialogPrompts } from '../rootFile';
import {
  SlackAttachment,
  SlackButtonAction,
  SlackInteractiveMessage
} from '../../SlackModels/SlackMessageModels';
import { SlackDialog, SlackDialogTextarea } from '../../SlackModels/SlackDialogModels';
import BatchUseRecordService from '../../../../services/BatchUseRecordService';
import RateTripController from '../../TripManagement/RateTripController';
import validateDialogSubmission from '../../../../helpers/slack/UserInputValidator/validateDialogSubmission';

class JoinRouteInteractions {
  static async handleViewAvailableRoutes(payload, respond) {
    const { type } = payload;
    if (type === 'interactive_message') {
      await JoinRouteInteractions.handleSendAvailableRoutesActions(payload, respond);
    }
    if (type === 'dialog_submission') {
      await JoinRouteInteractions.sendAvailableRoutesMessage(payload, respond);
    }
  }

  static async sendAvailableRoutesMessage(payload, respond) {
    const page = getPageNumber(payload);
    const sort = SequelizePaginationHelper.deserializeSort(
      'name,asc,batch,asc'
    );
    const pageable = { page, sort, size: SLACK_DEFAULT_SIZE };
    const where = JoinRouteInteractions.createWhereClause(payload);

    const {
      routes: availableRoutes,
      totalPages,
      pageNo: currentPage
    } = await RouteService.getRoutes(pageable, where);
    const availableRoutesMessage = RoutesHelpers.toAvailableRoutesAttachment(
      availableRoutes,
      currentPage,
      totalPages
    );
    respond(availableRoutesMessage);
  }

  static async handleSendAvailableRoutesActions(payload, respond) {
    const { name: actionName } = payload.actions[0];
    if (actionName === 'See Available Routes' || actionName.startsWith('page_')) {
      await JoinRouteInteractions.sendAvailableRoutesMessage(payload, respond);
      return;
    }
    triggerPage(payload, respond);
  }

  static createWhereClause(payload) {
    const { submission } = payload;
    const where = (submission && submission.search) ? {
      status: 'Active',
      name: submission.search
    } : {
      status: 'Active'
    };
    return where;
  }

  static handleJoinRouteActions(payload, respond) {
    try {
      return handleActions(payload, respond, JoinRouteInputHandlers);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static fullRouteCapacityNotice(state) {
    const text = 'This route is filled up to capacity.'
      + ' By clicking continue, a notification will be sent to Ops '
      + 'and they will get back to you asap';
    const attachment = new SlackAttachment('', text);
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('showAvailableRoutes', '< Back', state, '#FFCCAA'),
      new SlackButtonAction('continueJoinRoute', 'Continue', state)
    ]);
    attachment.addOptionalProps('join_route_actions');
    return new SlackInteractiveMessage('Selected Full Capacity Route', [
      attachment
    ]);
  }

  static async handleRouteBatchConfirmUse(payload, respond) {
    try {
      const { actions: [{ name: buttonName, value: batchUseRecordId }] } = payload;
      if (buttonName === 'taken') {
        await BatchUseRecordService
          .updateBatchUseRecord(batchUseRecordId, { userAttendStatus: 'Confirmed', reasonForSkip: '' });
        const ratingMessage = await RateTripController.sendRatingMessage(batchUseRecordId, 'rate_route');
        respond(ratingMessage);
      }
      if (buttonName === 'not_taken') {
        await BatchUseRecordService.updateBatchUseRecord(batchUseRecordId, { userAttendStatus: 'Skip' });
        await JoinRouteInteractions.hasNotTakenTrip(payload, respond);
        return new SlackInteractiveMessage('Noted');
      }
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async handleRouteSkipped(payload, respond) {
    try {
      const { submission, state: batchUseRecordId } = payload;
      const checkIfEmpty = validateDialogSubmission(payload);
      if (checkIfEmpty.length) { return { errors: checkIfEmpty }; }

      await BatchUseRecordService.updateBatchUseRecord(batchUseRecordId, { reasonForSkip: submission.tripNotTakenReason, userAttendStatus: 'Skip' });

      respond(new SlackInteractiveMessage('Thank you for sharing your experience.'));
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async hasNotTakenTrip(payload, respond) {
    try {
      respond(new SlackInteractiveMessage('Noted...'));
      const { actions: [{ value }] } = payload;
      const dialog = new SlackDialog(
        'route_skipped', 'Reason', 'Submit', true, value
      );
      const textarea = new SlackDialogTextarea(
        'Reason', 'tripNotTakenReason', 'Reason for not taking trip'
      );
      dialog.addElements([textarea]);
      respond(await DialogPrompts.sendDialog(dialog, payload));
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}

export default JoinRouteInteractions;
