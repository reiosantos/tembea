import {
  SlackDialogModel,
  SlackDialog,
  SlackDialogText,
  SlackDialogTextarea,
  SlackDialogSelectElementWithOptions,
  SlackDialogElementWithDataSource
} from '../SlackModels/SlackDialogModels';
import dateDialogHelper from '../../../helpers/dateHelper';
import createDialogForm from '../../../helpers/slack/createDialogForm';
import sendDialogTryCatch from '../../../helpers/sendDialogTryCatch';
import TeamDetailsService from '../../../services/TeamDetailsService';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import { cabService } from '../../../services/CabService';
import { driverService } from '../../../services/DriverService';
import CabsHelper from '../helpers/slackHelpers/CabsHelper';
import ProviderService from '../../../services/ProviderService';
import ProvidersHelper from '../helpers/slackHelpers/ProvidersHelper';
import ProviderHelper from '../../../helpers/providerHelper';

export const getPayloadKey = userId => `PAYLOAD_DETAILS${userId}`;

class DialogPrompts {
  static async sendTripDetailsForm(payload, formElementsFunction, callbackId, dialogTitle) {
    const { team: { id: teamId } } = payload;
    const dialogForm = createDialogForm(payload, formElementsFunction, callbackId, dialogTitle);
    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendRescheduleTripForm(payload, callbackId, state, dialogName) {
    const dialog = new SlackDialog(callbackId || payload.callback_id,
      dialogName, 'submit', true, state);

    dialog.addElements(dateDialogHelper.generateDialogElements());

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendTripReasonForm(payload) {
    const dialog = new SlackDialog('schedule_trip_reason',
      'Reason for booking trip', 'Submit', '', JSON.stringify(payload));
    const textarea = new SlackDialogTextarea('Reason', 'reason',
      'Enter reason for booking the trip');

    dialog.addElements([textarea]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendReasonDialog(
    payload, callbackId, state, dialogName, submitButtonText, submissionName, type = 'trip'
  ) {
    const tripOrRoute = type === 'trip' ? 'trip' : 'route';
    const dialog = new SlackDialog(callbackId || payload.callbackId,
      dialogName, submitButtonText, false, state);

    const commentElement = new SlackDialogTextarea('Reason',
      submissionName,
      `Why do you want to ${submitButtonText} this ${tripOrRoute}?`);
    dialog.addElements([commentElement]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendOperationsDeclineDialog(payload, callback_id = 'operations_reason_dialog_trips') {
    const actionTs = payload.message_ts;
    const { value } = payload.actions[0];
    const state = {
      trip: value,
      actionTs
    };
    const dialog = new SlackDialog(callback_id,
      'Reason for declining', 'Submit', false, JSON.stringify(state));
    dialog.addElements([
      new SlackDialogTextarea('Justification', 'opsDeclineComment')
    ]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendSelectCabDialog(payload) {
    const {
      actions: [{ value: tripId }], message_ts: timeStamp,
      channel: { id: channel }, user: { id: userId },
    } = payload;
    const { callback_id: callback } = payload;
    const { where, callbackId } = await ProvidersHelper.selectCabDialogHelper(callback, payload, userId);
    const { data: cabs } = await cabService.getCabs(undefined, where);
    const cabData = CabsHelper.toCabLabelValuePairs(cabs);
    const { data: drivers } = await driverService.getPaginatedItems(undefined, where);
    const driverData = CabsHelper.toCabDriverValuePairs(drivers);
    const state = { tripId, timeStamp, channel };
    const dialog = new SlackDialog(callbackId,
      'Complete The Request', 'Submit', false, JSON.stringify(state));
    dialog.addElements([
      new SlackDialogSelectElementWithOptions('Select A Driver',
        'driver', [...driverData]),
      new SlackDialogSelectElementWithOptions('Select A Vehicle',
        'cab', [...cabData])
    ]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  /**
   * Displays a select input field of list of providers
   *
   * @static
   * @param {Object} payload - Response object
   * @returns {void}
   * @memberof DialogPrompts
   */
  static async sendSelectProviderDialog(payload) {
    const {
      actions: [{ value: tripId }],
      message_ts: timeStamp,
      channel: { id: channel }
    } = payload;
    const providers = await ProviderService.getViableProviders();
    const providerData = ProviderHelper.generateProvidersLabel(providers);
    const state = {
      tripId, timeStamp, channel, isAssignProvider: true
    };
    const dialog = new SlackDialog('confirm_ops_approval',
      'Confirm Trip Request', 'Submit', false, JSON.stringify(state));
    dialog.addElements([
      new SlackDialogSelectElementWithOptions(
        'Select A Provider', 'provider', [...providerData]
      ),
      new SlackDialogTextarea(
        'Justification',
        'confirmationComment',
        'Reason why',
        'Enter reason for approving trip',
      )
    ]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendOperationsApprovalDialog(payload, respond) {
    const { value } = payload.actions[0];
    const { confirmationComment } = JSON.parse(value);
    let nextCallback; let
      title;
    const callbackId = 'operations_reason_dialog';
    if (payload.callback_id === 'operations_approval_route') {
      nextCallback = `${callbackId}_route`;
      title = 'Confirm Route Request';
    } else {
      nextCallback = `${callbackId}_trips`;
      title = 'Confirm Trip Request';
    }
    let dialog = new SlackDialog(nextCallback,
      title, 'Submit', false, value);
    dialog = DialogPrompts.addCabElementsToDialog(dialog, confirmationComment);
    respond(
      new SlackInteractiveMessage('Noted ...')
    );
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static addCabElementsToDialog(dialog, confirmationComment) {
    dialog.addElements([
      new SlackDialogText('Driver\'s name', 'driverName', 'Enter driver\'s name'),
      new SlackDialogText('Driver\'s contact', 'driverPhoneNo', 'Enter driver\'s contact'),
      new SlackDialogText(
        'Cab Registration number',
        'regNumber',
        'Enter the Cab\'s registration number'
      ),
      new SlackDialogText('Cab Model', 'model', 'Enter the Cab\'s model name'),
      new SlackDialogText('Cab Capacity', 'capacity', 'Enter the Cab\'s capacity'),
      new SlackDialogTextarea(
        'Justification',
        'confirmationComment',
        'Reason why',
        'Enter reason for approval',
        confirmationComment
      ),
    ]);
    return dialog;
  }

  static async sendOperationsNewRouteApprovalDialog(payload, state) {
    const dialog = new SlackDialog('operations_route_approvedRequest',
      'Approve Route Request', 'Submit', false, state);
    dialog.addElements([
      new SlackDialogText('Route\'s name', 'routeName', 'Enter route\'s name'),
      new SlackDialogText('Route\'s take-off time', 'takeOffTime', 'Enter take-off time',
        false, 'The time should be in the format (HH:mm), eg. 01:30')
    ]);
    const providers = await ProviderService.getViableProviders();
    const providersData = ProvidersHelper.toProviderLabelPairValues(providers);
    dialog.addElements([
      new SlackDialogSelectElementWithOptions('Select A Provider',
        'Provider', [...providersData]),
      new SlackDialogTextarea(
        'Justification',
        'confirmationComment',
        'Reason why',
        'Enter reason for approval',
      ),
    ]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendBusStopForm(payload, busStageList) {
    const { value } = payload.actions[0];
    const state = { tripId: value, timeStamp: payload.message_ts, channel: payload.channel.id };

    const dialog = new SlackDialog('new_route_handleBusStopSelected',
      'Drop off', 'Submit', false, JSON.stringify(state));

    const select = new SlackDialogSelectElementWithOptions(
      'Landmarks', 'selectBusStop', busStageList
    );
    select.optional = true;
    if (busStageList.length > 0) { dialog.addElements([select]); }

    dialog.addElements([
      new SlackDialogText('Landmark not listed?',
        'otherBusStop', 'latitude,longitude', true,
        'The location should be in the format (latitude, longitude), eg. -0.234,23.234'),
    ]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendLocationForm(payload, location = 'home') {
    const dialog = new SlackDialog(`new_route_${location}`,
      'Create New Route', 'Submit', true);
    const hint = 'e.g Andela Kenya, Nairobi';
    dialog.addElements([
      new SlackDialogText(`Enter ${location} Address: `,
        'location', `Type in your ${location} address`, false, hint)
    ]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendSkipPage(payload, value, callbackId) {
    const dialog = new SlackDialog(callbackId,
      'Page to skip to', 'Submit', false, value);
    const textarea = new SlackDialogText('Page Number', 'pageNumber',
      'Page to skip to');

    dialog.addElements([textarea]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendSearchPage(payload, value, callbackId, respond) {
    respond(new SlackInteractiveMessage('Noted ...'));
    const dialog = new SlackDialog(callbackId,
      'Search', 'Submit', false, value);

    const hint = 'e.g Emmerich Road';
    const textarea = new SlackDialogText('Search', 'search',
      'Enter the route name to search', false, hint);

    dialog.addElements([textarea]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendNewRouteForm(payload) {
    const selectManager = new SlackDialogElementWithDataSource('Select Manager', 'manager');
    const workingHours = new SlackDialogText(
      'Working Hours', 'workingHours',
      'Enter Working Hours', false, 'Hint: (From - To) hh:mm - hh:mm. e.g 20:30 - 02:30'
    );

    const dialog = new SlackDialog(
      'new_route_handlePreviewPartnerInfo', 'Engagement Information', 'Submit', true
    );

    dialog.addElements([selectManager, workingHours]);

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const { team: { id: teamId } } = payload;
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendLocationCoordinatesForm(payload) {
    const dialog = new SlackDialog(
      'new_route_suggestions', 'Home address coordinates', 'Submit', true
    );
    const hint = 'e.g -1.219539, 36.886215';
    dialog.addElements([
      new SlackDialogText(
        'Address coordinates:', 'coordinates',
        'Type in your home address latitude and longitude', false, hint
      )
    ]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendLocationDialogToUser(state) {
    const dialog = new SlackDialog(
      'schedule_trip_resubmitLocation', 'Location Details', 'Submit', true,
      state
    );
    const { value } = state.actions[0];
    const hint = 'Andela Nairobi, Kenya';
    const pickupOrDestination = value === 'no_Pick up' ? 'Pickup' : 'Destination';
    dialog.addElements([
      new SlackDialogText(
        `${pickupOrDestination} Location: `, `${pickupOrDestination}_location`,
        `Enter your ${pickupOrDestination} details`, false, hint
      )
    ]);
    await DialogPrompts.sendDialog(dialog, state);
  }

  static async sendEngagementInfoDialogToManager(payload, callback, state, defaultValues = {}) {
    const dialog = new SlackDialog(callback,
      'Fellow\'s Engagement', 'Submit', true, state);
    const sdName = 'startDate';
    const edName = 'endDate';
    const hint = 'hint: dd/mm/yyyy. example: 31/01/2019';
    const sdPlaceholder = 'Start Date';
    const edPlaceholder = 'End Date';
    const startDate = new SlackDialogText(
      `Engagement ${sdPlaceholder}`, sdName, sdPlaceholder, false, hint, defaultValues[sdName]
    );
    const endDate = new SlackDialogText(
      `Engagement ${edPlaceholder}`, edName, edPlaceholder, false, hint, defaultValues[edName]
    );
    dialog.addElements([startDate, endDate]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendDialog(dialog, payload) {
    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const { team: { id: teamId } } = payload;
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendTripNotesDialogForm(payload, formElementsFunction, callbackId, dialogTitle, state) {
    const { team: { id: teamId } } = payload;
    const dialogForm = createDialogForm(payload, formElementsFunction, callbackId, dialogTitle, state);
    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken, state);
  }
}
export default DialogPrompts;
