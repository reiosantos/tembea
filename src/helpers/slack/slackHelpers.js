import models from '../../database/models';
import WebClientSingleton from '../../utils/WebClientSingleton';
import TeamDetailsService from '../../services/TeamDetailsService';
import UserService from '../../services/UserService';


const {
  Department, User, TripRequest
} = models;

class SlackHelpers {
  static async getDepartments() {
    const departments = await Department.findAll({
      include: ['head']
    });
    return departments.map(item => ({
      label: item.dataValues.name,
      value: item.dataValues.id,
      head: item.dataValues.head ? item.dataValues.head.dataValues : item.dataValues.head
    }));
  }

  static async getHeadByDepartmentId(departmentId) {
    const department = await Department.findByPk(departmentId, {
      include: [{
        model: User,
        as: 'head'
      }]
    });

    const { dataValues: { head: { dataValues: theHead } } } = department;

    return theHead;
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

  static async findOrCreateUserBySlackId(slackId, teamId) {
    const user = await UserService.getUserBySlackId(slackId);
    if (user) return user;
    const userInfo = await SlackHelpers.getUserInfoFromSlack(slackId, teamId);
    const newUser = await SlackHelpers.createUserFromSlackUserInfo(userInfo);
    return newUser;
  }

  static async getUserInfoFromSlack(slackId, teamId) {
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const userInfo = await SlackHelpers.fetchUserInformationFromSlack(slackId, slackBotOauthToken);
    return userInfo;
  }

  static async fetchUserInformationFromSlack(slackId, token) {
    const slackClient = new WebClientSingleton();
    const { user } = await slackClient.getWebClient(token).users.info({
      user: slackId
    });
    return user;
  }

  static async createUserFromSlackUserInfo(userInfo) {
    const { real_name: name, profile: { email }, id } = userInfo;
    const user = {
      slackId: id,
      name,
      email
    };
    return UserService.findOrCreateNewUserWithSlackId(user);
  }

  static async getTripRequest(tripId) {
    const tripRequest = await TripRequest.findByPk(tripId, {
      include: ['rider', 'requester', 'destination', 'origin', 'department',
        'approver', 'confirmer', 'decliner', 'cab', 'tripDetail']
    });
    return tripRequest.dataValues;
  }

  static async isRequestApproved(requestId, slackId) {
    let isApproved = false;
    let approvedBy = null;

    const trip = await TripRequest.findByPk(requestId);

    if (!trip.dataValues) {
      return { isApproved: false, approvedBy };
    }

    const {
      dataValues: {
        tripStatus,
        approvedById
      }
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

    const response = await TripRequest.findByPk(requestId);

    if (!response) return approved;
    const user = await SlackHelpers.findUserByIdOrSlackId(managerId);

    if (!user.id) return approved;

    const update = await response.update({
      approvedById: user.id,
      managerComment: description,
      tripStatus: 'Approved',
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
    const { tripStatus } = await SlackHelpers.getTripRequest(tripRequestId);
    return tripStatus === 'Cancelled';
  }
}
export default SlackHelpers;
