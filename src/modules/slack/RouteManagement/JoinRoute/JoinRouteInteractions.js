import moment from 'moment';
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
import Validators from '../../../../helpers/slack/UserInputValidator/Validators';
import CleanData from '../../../../helpers/cleanData';
import ConfirmRouteUseJob from '../../../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import env from '../../../../config/environment';
import UserService from '../../../../services/UserService';
import UpdateSlackMessageHelper from '../../../../helpers/slack/updatePastMessageHelper';
import HomebaseService from '../../../../services/HomebaseService';

class JoinRouteInteractions {
  static async handleViewAvailableRoutes(data, respond) {
    const payload = CleanData.trim(data);
    const { type } = payload;
    if (type === 'interactive_message') {
      await JoinRouteInteractions.handleSendAvailableRoutesActions(payload, respond);
    }
    if (type === 'dialog_submission') {
      await JoinRouteInteractions.sendAvailableRoutesMessage(payload, respond);
    }
  }

  static async sendAvailableRoutesMessage(data, respond) {
    const { origin = '' } = data.store || {};
    if (origin) { UpdateSlackMessageHelper.newUpdateMessage(origin, { text: 'Noted...' }); }
    const payload = CleanData.trim(data);
    const page = getPageNumber(payload);
    const sort = SequelizePaginationHelper.deserializeSort(
      'name,asc,batch,asc'
    );

    const homebase = await HomebaseService.getHomeBaseBySlackId(payload.user.id);
    const pageable = { page, sort, size: SLACK_DEFAULT_SIZE };
    const where = JoinRouteInteractions.createWhereClause(payload);
    const isSearch = data.type === 'dialog_submission' && data.submission.search;

    const {
      routes: availableRoutes,
      totalPages,
      pageNo: currentPage
    } = await RouteService.getRoutes(pageable, where, homebase.id);
    const availableRoutesMessage = RoutesHelpers.toAvailableRoutesAttachment(
      availableRoutes,
      currentPage,
      totalPages,
      isSearch
    );
    respond(availableRoutesMessage);
  }

  static async sendCurrentRouteMessage({ user: { id } }, respond) {
    const { routeBatchId } = await UserService.getUserBySlackId(id);
    const routeInfo = await RouteService.getRouteBatchByPk(routeBatchId, true);
    const currentRouteMessage = RoutesHelpers.toCurrentRouteAttachment(routeInfo);
    respond(currentRouteMessage);
  }

  static async handleSendAvailableRoutesActions(data, respond) {
    const payload = CleanData.trim(data);
    const { name: actionName } = payload.actions[0];
    if (actionName === 'See Available Routes' || actionName.startsWith('page_')) {
      await JoinRouteInteractions.sendAvailableRoutesMessage(payload, respond);
      return;
    }
    triggerPage(payload, respond);
  }

  static createWhereClause(data) {
    const payload = CleanData.trim(data);
    const { submission } = payload;
    const where = (submission && submission.search) ? {
      status: 'Active',
      name: submission.search
    } : {
      status: 'Active'
    };
    return where;
  }

  static handleJoinRouteActions(data, respond) {
    try {
      const payload = CleanData.trim(data);
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
      const { actions: [{ name: buttonName }] } = payload;
      const [batchRecordId, batchUseRecordId] = payload.actions[0].value.split(' ');
      if (buttonName === 'taken') {
        await BatchUseRecordService.updateBatchUseRecord(batchUseRecordId, { userAttendStatus: 'Confirmed', reasonForSkip: '' });
        const ratingMessage = await RateTripController.sendRatingMessage(batchUseRecordId, 'rate_route');
        respond(ratingMessage);
      }
      if (buttonName === 'not_taken') {
        await BatchUseRecordService.updateBatchUseRecord(batchUseRecordId, { userAttendStatus: 'Skip' });
        await JoinRouteInteractions.hasNotTakenTrip(payload, respond);
      }
      if (buttonName === 'still_on_trip') {
        await BatchUseRecordService.updateBatchUseRecord(batchUseRecordId, {
          userAttendStatus: 'Pending'
        });
        const extensionTime = env.NODE_ENV.includes('production') ? { hours: 0, minutes: 30, seconds: 0 } : { hours: 0, minutes: 0, seconds: 10 };
        const rescheduleTime = moment(new Date()).add(extensionTime).format();
        ConfirmRouteUseJob.scheduleTripCompletionNotification({ takeOff: rescheduleTime, recordId: batchRecordId });
        return new SlackInteractiveMessage('Noted... We will get back to you soon');
      }
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async handleRouteSkipped(payload, respond) {
    try {
      const { submission, state: batchUseRecordId } = payload;
      const checkIfEmpty = Validators.validateDialogSubmission(payload);
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
