import { Cache, SlackHelpers } from '../../../slack/RouteManagement/rootFile';
import {
  SlackText, Block, BlockTypes, SelectElement, ElementTypes, ButtonElement,
  BlockMessage, CancelButtonElement
} from '../../models/slack-block-models';
import NewSlackHelpers, { sectionDivider } from '../../helpers/slack-helpers';
import { getTripKey } from '../../../../helpers/slack/ScheduleTripInputHandlers';
import DepartmentService from '../../../../services/DepartmentService';
import { SlackActionButtonStyles } from '../../../slack/SlackModels/SlackMessageModels';
import NewLocationHelpers, { getPredictionsKey } from '../../helpers/location-helpers';
import {
  tripReasonSchema, createUserDestinationSchema, tripPaymentSchema
} from '../schemas';
import userTripActions from './actions';
import userTripBlocks from './blocks';
import PreviewTripBooking from './preview-trip-booking-helper';
import tripService from '../../../../services/TripService';

export default class UserTripHelpers {
  static createStartMessage() {
    const headerText = new SlackText('Who are you booking for?');
    const header = new Block().addText(headerText);
    const mainButtons = [
      new ButtonElement(new SlackText('For Me'), 'forMe',
        userTripActions.forMe, SlackActionButtonStyles.primary),
      new ButtonElement(new SlackText('For Someone'), 'forSomeone',
        userTripActions.forSomeone, SlackActionButtonStyles.primary)
    ];

    const newTripBlock = new Block(BlockTypes.actions, userTripBlocks.start);
    newTripBlock.addElements(mainButtons);

    const navigation = UserTripHelpers.getTripNavBlock('back_to_launch');

    const blocks = [header, newTripBlock, new Block(BlockTypes.divider), navigation];
    const message = new BlockMessage(blocks);
    return message;
  }

  static getAddPassengersMessage(forSelf = 'true') {
    const noOfPassengers = NewSlackHelpers.toSlackDropdown(SlackHelpers.noOfPassengers());

    const textBlock = new Block().addText(new SlackText('Any more passengers?'));

    const passengersActions = new Block(BlockTypes.actions, userTripBlocks.addPassengers);
    const selectPassengers = new SelectElement(
      ElementTypes.staticSelect, 'No. of passengers',
      userTripActions.addExtraPassengers
    );
    selectPassengers.addOptions(noOfPassengers);

    const noButton = new ButtonElement(new SlackText('No'), '0', userTripActions.noPassengers,
      'primary');
    passengersActions.addElements([selectPassengers, noButton]);

    const backActionId = forSelf === 'true' ? userTripActions.forMe : userTripActions.forSomeone;
    const navigation = this.getTripNavBlock(backActionId);

    const blocks = [textBlock, passengersActions, sectionDivider, navigation];
    const message = new BlockMessage(blocks);
    return message;
  }

  static getTripNavBlock(value) {
    return NewSlackHelpers.getNavBlock(userTripBlocks.navBlock,
      userTripActions.back, value);
  }

  static getRiderSelectMessage() {
    const options = new SelectElement(ElementTypes.userSelect, 'Select a passenger',
      userTripActions.setPassenger);
    const header = new Block(BlockTypes.section)
      .addText(new SlackText('Who are you booking the ride for?'));

    const actions = new Block(BlockTypes.actions, userTripBlocks.setRider).addElements([options]);

    const navigation = this.getTripNavBlock(userTripActions.forMe);

    const message = new BlockMessage([header, actions, sectionDivider, navigation]);
    return message;
  }

  static async getDepartmentListMessage(payload) {
    const { forMe } = await Cache.fetch(getTripKey(payload.user.id));
    const personify = forMe ? 'your' : 'passenger\'s';

    const header = new Block(BlockTypes.section)
      .addText(new SlackText(`Please select ${personify} department.`));

    const departmentsList = await DepartmentService.getDepartmentsForSlack(payload.team.id);
    const departmentBlock = new Block(BlockTypes.actions, userTripBlocks.selectDepartment);
    const departmentButtons = departmentsList.map(
      department => new ButtonElement(new SlackText(department.label),
        department.value.toString(),
        `${userTripActions.getDepartment}_${department.value}`,
        SlackActionButtonStyles.primary)
    );
    departmentBlock.addElements(departmentButtons);

    const navigation = this.getTripNavBlock(userTripActions.addExtraPassengers);

    const message = new BlockMessage([header, departmentBlock, sectionDivider, navigation]);
    return message;
  }

  static async getPostForMeMessage(userId) {
    const userValue = await Cache.fetch(getTripKey(userId));
    let message;
    if (userValue.forMe) {
      message = this.getAddPassengersMessage();
    } else {
      message = this.getRiderSelectMessage();
    }
    return message;
  }

  static createContToDestMsg() {
    const header = new Block(BlockTypes.section)
      .addText(new SlackText('Please click to continue'));

    const continueBlock = new Block(BlockTypes.actions, userTripBlocks.getDestFields);

    continueBlock.addElements([
      new ButtonElement(new SlackText('Enter Destinaton'),
        'select_destination',
        userTripActions.sendDest,
        SlackActionButtonStyles.primary)
    ]);

    const navigation = this.getTripNavBlock(userTripActions.getDepartment);
    const message = new BlockMessage([header, continueBlock, sectionDivider, navigation]);
    return message;
  }

  static async createTripSummaryMsg(tripDetails) {
    const fields = await PreviewTripBooking.getPreviewFields(tripDetails);
    const header = new Block(BlockTypes.section)
      .addText(new SlackText('Trip request preview'))
      .addFields(fields);
    const previewActionsBlock = new Block(BlockTypes.actions, userTripBlocks.confirmTrip);
    previewActionsBlock.addElements([
      new ButtonElement(new SlackText('Confirm'), 'confirm',
        userTripActions.confirmTripRequest,
        SlackActionButtonStyles.primary),
      new CancelButtonElement('Cancel', 'cancel', userTripActions.cancelTripRequest, {
        title: 'Are you sure?',
        description: 'Do you really want to cancel this trip request',
        confirmText: 'Yes',
        denyText: 'No'
      })
    ]);

    const message = new BlockMessage([header, previewActionsBlock]);
    return message;
  }

  static async getLocationVerificationMsg(location, userId, selectActionId, backActionValue) {
    const locationOptions = {
      selectBlockId: userTripBlocks.confirmLocation,
      selectActionId,
      navBlockId: userTripBlocks.navBlock,
      navActionId: userTripActions.back,
      backActionValue,
    };
    return NewLocationHelpers.getLocationVerificationMsg(location, userId, locationOptions);
  }

  static async getPostPickupMessage(payload) {
    const message = payload.submission.pickup !== 'Others'
      ? this.createContToDestMsg()
      : await this.getLocationVerificationMsg(payload.submission.othersPickup,
        payload.user.id,
        userTripActions.selectPickupLocation,
        userTripActions.getDepartment);
    return !message ? this.createContToDestMsg() : message;
  }

  static async getPostDestinationMessage(payload) {
    const tripDetails = await Cache.fetch(getTripKey(payload.user.id));
    const message = payload.submission.destination !== 'Others'
      ? await this.createTripSummaryMsg(tripDetails)
      : await this.getLocationVerificationMsg(payload.submission.othersDestination,
        payload.user.id,
        userTripActions.selectDestinationLocation,
        userTripActions.sendDest);
    return !message ? this.createTripSummaryMsg(tripDetails) : message;
  }

  static async setReason(userId, data) {
    let submission;
    try {
      submission = NewSlackHelpers.dialogValidator(data, tripReasonSchema);
      await Cache.save(getTripKey(userId), 'reason', submission.reason);
    } catch (err) {
      return err;
    }
  }

  static async handlePickUpDetails(user, data) {
    const tripData = await UserTripHelpers.updateTripData(user, data);
    await Cache.saveObject(getTripKey(user.id), tripData);
  }

  static async handleLocationVerfication(user, location, type) {
    const placeIds = await UserTripHelpers.getCachedPlaceIds(user.id);
    const { lat, lng } = await NewLocationHelpers.handleLocationVerfication(placeIds, location);
    const updateTripData = await NewLocationHelpers.updateLocation(
      type, user.id, placeIds[location], lat, lng, location
    );
    await Cache.saveObject(getTripKey(user.id), updateTripData);
    const tripDetails = await Cache.fetch(getTripKey(user.id));
    const message = this.getPostVerficationMsg(type, tripDetails);
    return message;
  }

  static async getCachedPlaceIds(userId) {
    const placeIds = await Cache.fetch(getPredictionsKey(userId));
    return placeIds;
  }

  static getPostVerficationMsg(type, tripDetails) {
    const message = type === 'pickup'
      ? this.createContToDestMsg() : this.createTripSummaryMsg(tripDetails);

    return message;
  }

  static hasErrors(submission) {
    return submission && submission.errors;
  }

  static async handleDestinationDetails(user, data) {
    try {
      const { pickup, othersPickup } = await Cache.fetch(getTripKey(user.id));
      const thePickup = pickup === 'Others' ? othersPickup : pickup;
      const submission = NewSlackHelpers.dialogValidator(data,
        createUserDestinationSchema(thePickup));
      const tripDetails = await NewLocationHelpers.getDestinationCoordinates(user.id, submission);
      await Cache.saveObject(getTripKey(user.id), tripDetails);
    } catch (err) {
      return err;
    }
  }

  static async updateTripData(user, { pickup, othersPickup, dateTime },
    tripType = 'Regular Trip') {
    const userTripDetails = await Cache.fetch(getTripKey(user.id));
    const userTripData = { ...userTripDetails };
    const pickupCoords = await NewLocationHelpers.getCoordinates(pickup);
    if (pickupCoords) {
      const { longitude, latitude, id } = pickupCoords.location;
      Object.assign(userTripData, {
        pickupId: id,
        pickupLat: latitude,
        pickupLong: longitude
      });
    }
    Object.assign(userTripData, {
      id: user.id,
      name: user.name,
      pickup,
      othersPickup,
      dateTime,
      departmentId: userTripDetails.departmentId,
      department: userTripDetails.department,
      tripType
    });
    return userTripData;
  }

  static async savePayment(payload) {
    try {
      const { submission, state } = payload;
      submission.price = parseFloat(submission.price);
      NewSlackHelpers.dialogValidator(submission, tripPaymentSchema);
      const { tripId } = JSON.parse(state);
      const { price } = submission;
      await tripService.updateRequest(tripId, { cost: price });
    } catch (err) {
      return err;
    }
  }
}
