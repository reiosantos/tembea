import { SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import CleanData from '../../../../helpers/cleanData';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import Cache from '../../../../cache';
import { getTripKey } from '../../../../helpers/slack/ScheduleTripInputHandlers';
import ViewTripHelper from './ViewTripHelper';
import TripRescheduleHelper from './rescheduleHelper';
import CancelTripController from '../../TripManagement/CancelTripController';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import RescheduleTripController from '../../TripManagement/RescheduleTripController';
import tripService from '../../../../services/TripService';
import OpsTripActions from '../../TripManagement/OpsTripActions';
import SlackInteractions from '../../SlackInteractions';
import UserTripBookingController from '../../../new-slack/trips/user/user-trip-booking-controller';
import OpsDialogPrompts from '../../SlackPrompts/OpsDialogPrompts';

class SlackInteractionsHelpers {
  static async welcomeMessage(data, respond) {
    const payload = CleanData.trim(data);
    const { actions: [{ value: action }] } = payload;

    switch (action) {
      case 'book_new_trip':
        await UserTripBookingController.startTripBooking(payload, respond);
        break;
      case 'view_trips_itinerary':
        await InteractivePrompts.sendTripItinerary(payload, respond);
        break;
      case 'change_location':
        await InteractivePrompts.changeLocation(payload, respond);
        break;
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea'));
        break;
    }
  }

  static goodByeMessage() {
    return new SlackInteractiveMessage('Thank you for using Tembea. See you again.');
  }

  static isCancelMessage(data) {
    const payload = CleanData.trim(data);
    return (payload.type === 'interactive_message' && payload.actions[0].value === 'cancel');
  }

  static async bookNewTrip(data, respond) {
    const payload = CleanData.trim(data);
    const action = payload.actions[0].value;
    switch (action) {
      case 'true':
      case 'false':
        await Cache.save(getTripKey(payload.user.id), 'forSelf', action);
        DialogPrompts.sendTripReasonForm(payload);
        break;
      default:
        respond(SlackInteractionsHelpers.goodByeMessage());
    }
  }

  static sendCommentDialog(data, respond) {
    const payload = CleanData.trim(data);
    const action = payload.actions[0].name;
    switch (action) {
      case ('confirmTrip'):
        DialogPrompts.sendOperationsApprovalDialog(payload, respond);
        break;
      case ('declineRequest'):
        DialogPrompts.sendOperationsDeclineDialog(payload);
        break;
      default:
        break;
    }
  }

  static async handleItineraryActions(data, respond) {
    const payload = CleanData.trim(data);
    const { name, value } = payload.actions[0];
    let message;
    switch (name) {
      case 'view':
        message = await ViewTripHelper.displayTripRequest(value, payload.user.id);
        break;
      case 'reschedule':
        message = await TripRescheduleHelper.sendTripRescheduleDialog(payload, value);
        break;
      case 'cancel_trip':
        message = await CancelTripController.cancelTrip(value, payload);
        break;
      default:
        message = SlackInteractionsHelpers.goodByeMessage();
    }
    if (message) respond(message);
  }

  static async handleReschedule(data, respond) {
    const payload = CleanData.trim(data);
    let { state } = payload;
    const {
      submission: {
        newMonth, newDate, newYear, time
      },
      user
    } = payload;
    const date = `${newDate}/${+newMonth + 1}/${newYear} ${time}`;
    state = state.split(' ');
    const { team: { id: teamId } } = payload;
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const errors = await RescheduleTripController.runValidations(date, user, slackBotOauthToken);
    if (errors.length > 0) {
      return { errors };
    }
    const message = await RescheduleTripController.rescheduleTrip(state[2], date, payload, respond);
    respond(message);
  }

  static approveTripRequestByManager(data, trip, respond) {
    const payload = CleanData.trim(data);
    const { channel, actions } = payload;

    if (trip.isApproved) {
      respond(new SlackInteractiveMessage(
        `This trip has already been approved by ${trip.approvedBy}`
      ));
      return;
    }
    return DialogPrompts.sendReasonDialog(payload,
      'approve_trip',
      `${payload.original_message.ts} ${channel.id} ${actions[0].value}`,
      'Approve', 'Approve', 'approveReason');
  }

  static async handleOpsAction(data, respond) {
    const payload = CleanData.trim(data);
    const {
      actions: [{ selected_options: selectedOptions, value: values }],
      channel: { id: channelId },
      team: { id: teamId },
      user: { id: userId }, original_message: { ts: timeStamp }
    } = payload;

    let options;
    const action = payload.actions[0].name;
    if (action === 'declineRequest') {
      return DialogPrompts.sendOperationsDeclineDialog(payload);
    }
    if (selectedOptions) {
      options = selectedOptions[0].value.split('_');
    } else {
      options = values.split('_');
    }

    const [value, tripId] = options;
    await SlackInteractionsHelpers.handleOpsSelectAction(value, tripId, teamId, channelId, userId,
      timeStamp, payload, data, respond);
  }

  static async startProviderActions(data, respond) {
    const payload = CleanData.trim(data);
    const action = payload.state || payload.actions[0].value;
    switch (action.split('_')[0]) {
      case 'accept':
        await DialogPrompts.sendSelectCabDialog(payload);
        break;
      default:
        respond(SlackInteractionsHelpers.goodByeMessage());
        break;
    }
  }

  static async handleOpsSelectAction(value, tripId, teamId, channelId, userId, timeStamp, payload,
    data, respond) {
    const isOpsAssignCab = value === 'assignCab';
    const trip = await tripService.getById(tripId);
    const tripIsCancelled = trip.tripStatus === 'Cancelled';
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    if (tripIsCancelled) {
      return OpsTripActions.sendUserCancellation(
        channelId, slackBotOauthToken, trip, userId, timeStamp
      );
    }
    if (isOpsAssignCab) {
      const dialog = await OpsDialogPrompts.selectDriverAndCab(payload, tripId);
      return dialog;
    }
    const correctedData = { ...data, actions: [{ ...data.actions[0], value: trip.id }] };
    return SlackInteractions.handleSelectProviderAction(correctedData, respond);
  }
}

export default SlackInteractionsHelpers;
