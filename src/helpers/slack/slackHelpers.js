import { Sequelize } from 'sequelize';
import models from '../../database/models';
import bugsnagHelper from '../bugsnagHelper';

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

    return department.dataValues.head.dataValues;
  }

  static async findUserByIdOrSlackId(userId) {
    let userInfo = {};
    let normalizedId = userId;

    if (!Number.isInteger(Number.parseInt(userId, 10))) {
      normalizedId = 0;
    }
    const user = await User.findOne(
      { where: { [Sequelize.Op.or]: [{ slackId: `${userId}` }, { id: normalizedId }] } }
    );

    if (user && user.dataValues) {
      userInfo = { ...user.dataValues };
    }
    return userInfo;
  }

  static findSelectedDepartment(departmentId) {
    if (Number.isNaN(parseInt(departmentId, 10))) {
      throw Error('The parameter provided is not valid. It must be a valid number');
    }

    return Department.findByPk(departmentId, { include: ['head'] });
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

    const { dataValues: tripRequest } = trip;
    const { tripStatus, approvedById } = tripRequest;

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

  /**
 * @static async getUserBySlackId
 * @description this methods queries the DB for users by slackId
 * @param {*} slackId
 * @returns user object
 * @memberof DataHelper
 */
  static async getUserBySlackId(slackId) {
    try {
      const user = await User.findOne({
        where: { slackId },
        raw: true
      });
      return user;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static noOfPassengers() {
    const passengerNumbers = [...Array(10)].map(
      (label, value) => ({ text: value + 1, value: value + 1 })
    );

    return passengerNumbers;
  }
}

export default SlackHelpers;
