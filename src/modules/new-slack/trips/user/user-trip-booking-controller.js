import {
  Block, BlockMessage
} from '../../models/slack-block-models';
import UserTripHelpers from './user-trip-helpers';
import {
  SlackInteractiveMessage
} from '../../../slack/SlackModels/SlackMessageModels';
import SlackController from '../../../slack/SlackController';
import UpdateSlackMessageHelper from '../../../../helpers/slack/updatePastMessageHelper';
import { getTripKey } from '../../../../helpers/slack/ScheduleTripInputHandlers';
import Cache from '../../../../cache';
import Interactions from './interactions';
import NewSlackHelpers from '../../helpers/slack-helpers';
import userTripActions from './actions';
import ScheduleTripController from '../../../slack/TripManagement/ScheduleTripController';
import { bugsnagHelper } from '../../../slack/RouteManagement/rootFile';
import Validators from './validators';

export default class UserTripBookingController {
  static startTripBooking(payload, respond) {
    const message = UserTripHelpers.createStartMessage();
    respond(message);
  }

  static async forMe(payload, respond) {
    const forMe = payload.actions[0].action_id === userTripActions.forMe;
    await Cache.save(getTripKey(payload.user.id), 'forMe', forMe);

    if (forMe) {
      const state = { origin: payload.response_url };
      await Interactions.sendTripReasonForm(payload, state);
    } else {
      const message = UserTripHelpers.getRiderSelectMessage();
      respond(message);
    }
  }

  static async saveRider(payload) {
    const rider = payload.actions[0].selected_user;
    await Cache.save(getTripKey(payload.user.id), 'rider', rider);
    const state = { origin: payload.response_url };
    await Interactions.sendTripReasonForm(payload, state);
  }

  static async handleReasonSubmit(payload) {
    if (payload.submission) {
      const result = await UserTripHelpers
        .setReason(payload.user.id, payload.submission);
      if (result && result.errors) return result;
    }
    await Interactions.sendAddPassengers(payload.state);
  }

  static async saveExtraPassengers(payload, respond) {
    let noOfPassengers = payload.actions[0].value
      ? payload.actions[0].value : payload.actions[0].selected_option.value;
    noOfPassengers = +noOfPassengers + 1;
    await Cache.save(getTripKey(payload.user.id), 'passengers', noOfPassengers);
    const message = await UserTripHelpers.getDepartmentListMessage(payload);
    respond(message);
  }

  static async saveDepartment(payload) {
    const { value, text } = payload.actions[0];
    await Cache.save(getTripKey(payload.user.id), 'departmentId', value);
    await Cache.save(getTripKey(payload.user.id), 'department', text.text);
    const state = { origin: payload.response_url };
    const fields = await NewSlackHelpers.getPickupFields();
    await Interactions.sendDetailsForm(payload, state, {
      title: 'Pickup Details',
      submitLabel: 'Submit',
      callbackId: userTripActions.pickupDialog,
      fields
    });
  }

  static async savePickupDetails(payload, respond) {
    const submission = await Validators.validatePickUpSubmission(payload);
    if (UserTripHelpers.hasErrors(submission)) return submission;
    try {
      await UserTripHelpers.handlePickUpDetails(payload.user,
        submission);
      await Interactions.sendPostPickUpMessage(payload);
    } catch (err) {
      respond('Oops!!! Something went wrong.');
    }
  }

  static async sendDestinations(payload) {
    const state = { origin: payload.response_url };
    const fields = await NewSlackHelpers.getDestinationFields();
    await Interactions.sendDetailsForm(payload, state, {
      title: 'Destination Details',
      submitLabel: 'Submit',
      callbackId: userTripActions.destDialog,
      fields
    });
  }

  static async saveDestination(payload) {
    if (payload.submission) {
      const result = await UserTripHelpers.handleDestinationDetails(payload.user,
        payload.submission);
      if (UserTripHelpers.hasErrors(result)) return result;
    }
    await Interactions.sendPostDestinationMessage(payload);
  }

  static async confirmLocation(payload) {
    const location = payload.actions[0].selected_option.text.text;
    const type = payload.actions[0].action_id === userTripActions.selectPickupLocation
      ? 'pickup'
      : 'destination';
    const message = await UserTripHelpers.handleLocationVerfication(payload.user, location, type);
    const response = payload.response_url;
    await UpdateSlackMessageHelper.newUpdateMessage(response, message);
  }

  static async confirmTripRequest(payload, respond) {
    try {
      const { user: { id: userId } } = payload;
      const tripDetails = await Cache.fetch(getTripKey(userId));
      await ScheduleTripController.createTripRequest(payload, respond, tripDetails);
      await Cache.delete(getTripKey(userId));
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new BlockMessage([new Block().addText('Unsuccessful request. Kindly Try again')]));
    }
  }

  static async paymentRequest(payload, respond) {
    if (payload.submission) {
      const result = await UserTripHelpers.savePayment(payload);
      if (result && result.errors) return result;
    }
    const message = new BlockMessage([new Block().addText('Thank you for using Tembea')]);
    respond(message);
  }

  static async back(payload, respond) {
    const action = payload.actions[0].value;
    switch (action) {
      case 'back_to_launch':
        respond(SlackController.getWelcomeMessage());
        break;
      case userTripActions.forMe:
        return UserTripBookingController.startTripBooking(payload, respond);
      case userTripActions.forSomeone:
        return UserTripBookingController.handleReasonSubmit(payload, respond);
      case userTripActions.addExtraPassengers:
        respond(UserTripHelpers.getAddPassengersMessage());
        break;
      case userTripActions.getDepartment:
        respond(await UserTripHelpers.getDepartmentListMessage(payload));
        break;
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea'));
        break;
    }
  }

  static async updateState(state, data = { text: 'Noted' }) {
    await UpdateSlackMessageHelper.updateMessage(state, data);
  }

  static cancel(payload, respond) {
    const message = new BlockMessage([new Block().addText('Thank you for using Tembea')]);
    respond(message);
  }
}
