import { WebClient } from '@slack/client';
import TeamDetailsService from '../../services/TeamDetailsService';
import models from '../../database/models';
import HttpError from '../../helpers/errorHandler';

const { User } = models;
class UsersController {
  /**
   * @description Fetches the team details and handles it's errors
   * @param  {string} slackUrl The teams slack url
   * @returns {object} The complete team details
   */
  static async fetchTeamDetails(slackUrl) {
    try {
      const teamDetails = await TeamDetailsService.getTeamDetailsByTeamUrl(slackUrl.trim());
      HttpError.throwErrorIfNull(teamDetails, 'Slack team not found');
      return teamDetails;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      HttpError.throwErrorIfNull(null, 'Could not get team details', 500);
    }
  }

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
        "User not found. If your are providing a newEmail, it must be the same as the user's email on slack",
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
      } = slackUserInfo.user;

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
    const teamDetails = await UsersController.fetchTeamDetails(slackUrl);
    // Create the web client from team details
    const web = new WebClient(teamDetails.userToken);
    // Get user's slack Id
    return UsersController.getUserSlackInfo(web, newEmail || email);
  }

  /**
   * @description Updates the user record
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async updateRecord(req, res) {
    const {
      slackUrl, email, newEmail, newName, newPhoneNo
    } = req.body;

    try {
      const slackUserInfo = await UsersController.getUserInfo(slackUrl, email, newEmail);
      // Get the user info from the database
      let user = await UsersController.getUser(email);
      // Save the new record
      user = await UsersController.saveNewRecord(
        user,
        slackUserInfo,
        newName,
        newEmail,
        newPhoneNo
      );

      return res.status(200).json({
        success: true,
        message: 'User record updated',
        user: {
          name: user.name,
          email: user.email,
          phoneNo: user.phoneNo
        }
      });
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async newUserRecord(req, res) {
    const { slackUrl, email } = req.body;

    try {
      // Check if user already exists
      let message = 'User already exists';
      let user = await User.findOne({
        where: {
          email
        }
      });
      if (!user) {
        const slackUserInfo = await UsersController.getUserInfo(slackUrl, email);
        // Save the new user
        user = await UsersController.createNewUser(slackUserInfo);
        message = 'User has been successfully created';
      }

      return res.status(200).json({
        success: true,
        message,
        user: {
          name: user.name,
          email: user.email,
          phoneNo: user.phoneNo
        }
      });
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default UsersController;
