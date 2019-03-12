import tripService from '../../services/TripService';
import WebClientSingleton from '../../utils/WebClientSingleton';
import TeamDetailsService from '../../services/TeamDetailsService';
import UserService from '../../services/UserService';
import Cache from '../../cache';


class SlackHelpers {
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

  static async findOrCreateUserBySlackId(slackId, teamId) {
    const OneUser = await UserService.getUserBySlackId(slackId);
    if (OneUser) return OneUser;
    let userInfo = await SlackHelpers.getUserInfoFromSlack(slackId, teamId);
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
    const userInfo = await SlackHelpers.fetchUserInformationFromSlack(slackId, slackBotOauthToken);
    Cache.save(key, 'slackInfo', userInfo);
    return userInfo;
  }

  static async fetchUserInformationFromSlack(slackId, token) {
    const slackClient = new WebClientSingleton();
    const { user } = await slackClient.getWebClient(token).users.info({
      user: slackId
    });
    return user;
  }

  static async getTripRequest(tripId) {
    const tripRequest = await tripService.getById(tripId);
    return tripRequest.dataValues;
  }

  static async isRequestApproved(requestId, slackId) {
    let isApproved = false;
    let approvedBy = null;

    const trip = await tripService.getById(requestId);

    if (!trip.dataValues) {
      return { isApproved: false, approvedBy };
    }

    const {
      dataValues: { tripStatus, approvedById }
    } = trip;

    if (approvedById && tripStatus && tripStatus.toLowerCase() !== 'pending') {
      isApproved = true;
      const user = await SlackHelpers.findUserByIdOrSlackId(approvedById);
      approvedBy = slackId === user.slackId ? '*You*' : `<@${user.slackId}>`;
    }

    return { isApproved, approvedBy };
  }

  static async approveRequest(requestId, managerId, description) {
    let approved = false;

    const response = await tripService.getById(requestId);

    if (!response) return approved;
    const user = await SlackHelpers.findUserByIdOrSlackId(managerId);

    if (!user.id) return approved;

    const update = await response.update({
      approvedById: user.id,
      managerComment: description,
      tripStatus: 'Approved'
    });

    if (update) { approved = true; }

    return approved;
  }

  static noOfPassengers() {
    const passengerNumbers = [...Array(10)].map(
      (label, value) => ({ text: value + 1, value: value + 1 })
    );
    return passengerNumbers;
  }

  static async handleCancellation(tripRequestId) {
    const { tripStatus } = await tripService.getById(tripRequestId);
    return tripStatus === 'Cancelled';
  }
}
export default SlackHelpers;
