import { WebClient } from '@slack/client';
import Sequalize from 'sequelize';
import models from '../database/models';
import HttpError from '../helpers/errorHandler';
import TeamDetailsService from './TeamDetailsService';
import CleanData from '../helpers/cleanData';
import RemoveDataValues from '../helpers/removeDataValues';

const { User } = models;

class UserService {
  /**
   * @description Fetch the user's slack info
   * @param  {object} web The slack web client
   * @param  {string} email The user's email on slack
   * @return {object} The slack information
   */
  static async getUserSlackInfo(web, email) {
    try {
      return web.users.lookupByEmail({
        email: email.trim()
      });
    } catch (error) {
      HttpError.throwErrorIfNull(
        null,
        'User not found. If your are providing a newEmail, '
        + 'it must be the same as the user\'s email on slack',
        424
      );
    }
  }

  /**
   * @description Get the user by email from the database
   * @param  {string} email The email of the user on the db
   * @returns {object} The http response object
   */
  static async getUser(email) {
    try {
      const user = await User.findOne({
        where: {
          email
        }
      });

      HttpError.throwErrorIfNull(user, 'User not found');

      return user;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      HttpError.throwErrorIfNull(null, 'Could not update the user record', 500);
    }
  }


  static async findOrCreateNewUserWithSlackId(user) {
    const [newUser] = await User.findOrCreate({
      where: { slackId: user.slackId },
      defaults: { name: user.name, email: user.email }
    });
    return newUser.dataValues;
  }


  /**
   * @description Saves the new user record
   * @param  {object} user The user object returned by the database
   * @param  {object} slackUserInfo The information returned from slack on `users.lookupByEmail`
   * @param  {string} newName The new user's name
   * @param  {string} newEmail The new user's email
   * @param  {string} newPhoneNo The new user's phone number
   * @returns {object} The newly updated user info
   */
  static async saveNewRecord(user, slackUserInfo, newName, newEmail, newPhoneNo) {
    try {
      const modUser = user;
      modUser.slackId = slackUserInfo.user.id;
      modUser.name = (newName || user.dataValues.name).trim();
      modUser.email = (newEmail || user.dataValues.email).trim();
      modUser.phoneNo = (newPhoneNo || user.dataValues.phoneNo).trim();
      await modUser.save();

      return modUser.dataValues;
    } catch (error) {
      HttpError.throwErrorIfNull(null, 'Could not update user record', 500);
    }
  }

  /**
   * @description Creates a new user
   * @param  {object} slackUserInfo The information returned from slack on `users.lookupByEmail`
   * @returns {object} The new user info
   */
  static async createNewUser(slackUserInfo) {
    try {
      const {
        id,
        profile: { real_name, email } //eslint-disable-line
      } = CleanData.trim(slackUserInfo.user);

      const user = await User.create({
        slackId: id,
        name: real_name,
        email
      });

      return user.dataValues;
    } catch (error) {
      HttpError.throwErrorIfNull(null, 'Could not create user', 500);
    }
  }

  static async getUserInfo(slackUrl, email, newEmail) {
    const teamDetails = await TeamDetailsService.getTeamDetailsByTeamUrl(slackUrl);
    // Create the web client from team details
    if (!teamDetails) throw new HttpError('Slack team not found', 404);
    const web = new WebClient(teamDetails.userToken);
    // Get user's slack Id
    return UserService.getUserSlackInfo(web, newEmail || email);
  }

  /**
   * @description Get's paginated user records from db
   * @param  {number} size The size of a single page
   * @param  {number} page The page number
   * @returns {object} An array of users
   */
  static async getUsersFromDB(size, page) {
    return User.findAndCountAll({
      raw: true,
      limit: size,
      offset: (size * (page - 1)),
      order: [['id', 'DESC']]
    });
  }

  static async getPagedFellowsOnOrOffRoute(onRoute = true, { size, page }, filterBy) {
    const { homebaseId } = filterBy;
    const { Op } = Sequalize;
    const routeBatchCriteria = onRoute ? { [Op.ne]: null } : { [Op.eq]: null };
    const results = await User.findAndCountAll({
      limit: size,
      offset: (size * (page - 1)),
      where: {
        email: {
          [Op.iLike]: '%andela.com',
          [Op.notILike]: '%apprenticeship@andela.com'
        },
        routeBatchId: routeBatchCriteria,
        homebaseId
      },
    });
    return {
      data: results.rows.map(user => RemoveDataValues.removeDataValues(user)),
      pageMeta: {
        totalPages: Math.ceil(results.count / size),
        currentPage: page,
        limit: size,
        totalItems: results.count
      }
    };
  }

  static async getUserById(id) {
    const user = await User.findByPk(id);
    return user;
  }

  /**
 * @static async getUserBySlackId
 * @description this methods queries the DB for users by slackId
 * @param {*} slackId
 * @returns user object
 */
  static async getUserBySlackId(slackId) {
    const user = await User.findOne({
      where: { slackId },
    });
    return user;
  }

  /**
 * @static async getUserByEmail
 * @description this methods queries the DB for users by slackId
 * @param {string} email - the user email to find by
 * @param {object} options - additional options
 * @returns {object} user object
 */
  static async getUserByEmail(email, options = {}) {
    const user = await User.findOne({
      where: { email },
    });
    return options.plain ? user.get() : user;
  }

  /**
 * @static async updateUser
 * @description this methods updates user details by user id
 * @param {number} id
 * @param {object} updateObject
 * @returns user object
 */
  static async updateUser(id, updateObject) {
    const user = await User.update(
      { ...updateObject },
      { returning: true, where: { id } }
    );
    return user;
  }

  /**
   * @static async update User HomeBase
   * @description this methods updates user's home base
   * @param {number} userSlackId
   * @param {string} homeBaseId
   * @returns user's homebase ID
   */
  static async updateDefaultHomeBase(userSlackId, homebaseId) {
    const user = await UserService.getUserBySlackId(userSlackId);
    const { id: userId } = RemoveDataValues.removeDataValues(user);
    await UserService.updateUser(userId, { homebaseId });
    return homebaseId;
  }
}

export default UserService;
