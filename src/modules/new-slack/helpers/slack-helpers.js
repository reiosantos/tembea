import {
  ButtonElement, CancelButtonElement,
  SlackText, Block, BlockTypes
} from '../models/slack-block-models';
import Validators from '../../../helpers/slack/UserInputValidator/Validators';
import {
  SlackDialogError,
  SlackDialogSelectElementWithOptions,
  SlackDialogText
} from '../../slack/SlackModels/SlackDialogModels';
import { toLabelValuePairs, dateHint } from '../../../helpers/slack/createTripDetailsForm';
import { pickupLocations } from '../../../utils/data';
import UserService from '../../../services/UserService';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import Cache from '../../../cache';
import TeamDetailsService from '../../../services/TeamDetailsService';
import userTripActions from '../trips/user/actions';

export const sectionDivider = new Block(BlockTypes.divider);
export const defaultKeyValuePairs = { text: 'text', value: 'value' };

export default class NewSlackHelpers {
  static getNavButtons(backValue, backActionId) {
    const navigationButtons = [
      new ButtonElement(new SlackText('< Back'), backValue, backActionId),
      new CancelButtonElement('Cancel', 'cancel', userTripActions.cancel, {
        title: 'Are you sure?',
        description: 'Do you really want to cancel',
        confirmText: 'Yes',
        denyText: 'No'
      })
    ];
    return navigationButtons;
  }

  static getNavBlock(blockId, backActionId, backValue) {
    const navButtons = NewSlackHelpers.getNavButtons(backValue, backActionId);
    const navigation = new Block(BlockTypes.actions, blockId);
    navigation.addElements(navButtons);
    return navigation;
  }

  static dialogValidator(data, schema) {
    try {
      const results = Validators.validateSubmission(data, schema);
      return results;
    } catch (err) {
      const error = new Error('dialog validation failed');
      error.errors = err.errors.details.map((e) => {
        const key = e.path[0];
        return new SlackDialogError(key,
          e.message || 'the submitted property for this value is invalid');
      });
      throw error;
    }
  }

  static hasNeededProps(data, keyPairs) {
    let hasProps = false;
    if (data) {
      const func = Object.prototype.hasOwnProperty;
      hasProps = func.call(data, keyPairs.text) && func.call(data, keyPairs.value);
    }
    return hasProps;
  }

  static toSlackDropdown(data, keyPairs = defaultKeyValuePairs) {
    return data.filter(e => this.hasNeededProps(e, keyPairs))
      .map(entry => ({
        text: new SlackText(entry[keyPairs.text].toString()),
        value: entry[keyPairs.value].toString()
      }));
  }

  static async getPickupFields() {
    const locations = toLabelValuePairs(pickupLocations);
    const pickupField = new SlackDialogSelectElementWithOptions('Pickup location',
      'pickup', locations);

    const othersPickupField = new SlackDialogText('Others?',
      'othersPickup', 'Enter pickup location', true);

    const dateField = new SlackDialogText('Date and Time',
      'dateTime', 'dd/mm/yy hh:mm', false, dateHint);

    return [
      dateField,
      pickupField,
      othersPickupField,
    ];
  }

  static async getDestinationFields() {
    const locations = toLabelValuePairs(pickupLocations);
    const destinationField = new SlackDialogSelectElementWithOptions('Destination location',
      'destination', locations);

    const othersDestinationField = new SlackDialogText('Others?',
      'othersDestination', 'Enter destination', true);

    return [
      destinationField,
      othersDestinationField
    ];
  }

  static async findUserByIdOrSlackId(userId) {
    let user;
    const normalizedId = Number.parseInt(userId, 10);
    if (Number.isInteger(normalizedId)) {
      user = await UserService.getUserById(normalizedId);
    } else {
      user = await UserService.getUserBySlackId(userId);
    }
    const result = user ? user.dataValues : undefined;
    return result;
  }

  static async getUserInfo(slackId, slackBotOauthToken) {
    const cacheKey = `USER_SLACK_INFO_${slackId}`;
    const result = await Cache.fetch(cacheKey);
    if (result) return result;
    const { user } = await WebClientSingleton.getWebClient(slackBotOauthToken).users.info({
      user: slackId
    });
    await Cache.saveObject(cacheKey, user);

    return user;
  }

  static async findOrCreateUserBySlackId(slackId, teamId) {
    const OneUser = await UserService.getUserBySlackId(slackId);
    if (OneUser) return OneUser;
    let userInfo = await NewSlackHelpers.getUserInfoFromSlack(slackId, teamId);
    const user = userInfo;
    user.profile.real_name = userInfo.real_name;
    const newUser = await UserService.createNewUser(userInfo = { user });
    return newUser;
  }

  static async getUserInfoFromSlack(slackId, teamId) {
    const key = `${teamId}_${slackId}`;
    const result = await Cache.fetch(key);
    if (result && result.slackInfo) {
      return result.slackInfo;
    }
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const userInfo = await NewSlackHelpers
      .fetchUserInformationFromSlack(slackId, slackBotOauthToken);
    await Cache.save(key, 'slackInfo', userInfo);
    return userInfo;
  }

  static async fetchUserInformationFromSlack(slackId, token) {
    const { user } = await WebClientSingleton.getWebClient(token).users.info({
      user: slackId
    });
    return user;
  }
}
