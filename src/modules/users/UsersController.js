import { WebClient } from '@slack/client';
import bugsnag from '@bugsnag/js';
import TeamDetailsService from '../../services/TeamDetailsService';
import models from '../../database/models';

const { User } = models;

class UsersController {
  /**
   * @description Fetches the team details and handles it's errors
   * @param  {string} slackUrl The teams slack url
   * @param  {object} res The HTTP response object
   * @returns {object} The complete team details
   */
  static async fetchTeamDetails(slackUrl, res) {
    try {
      const teamDetails = await TeamDetailsService.getTeamDetailsByTeamUrl(slackUrl);
      if (!teamDetails) {
        res
          .status(404)
          .json({
            success: false,
            message: 'Slack team not found'
          });
        return;
      }
      return teamDetails;
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: 'Could not get team details'
        });
      throw new Error(error.message);
    }
  }

  
  /**
   * @description Fetch the user's slack info
   * @param  {object} web The slack web client
   * @param  {string} email The user's email on slack
   * @param  {object} res The HTTP response object
   * @return {object} The slack information
   */
  static async getUserSlackInfo(web, email, res) {
    try {
      const slackUserInfo = await web.users.lookupByEmail({
        email: email.trim()
      });
      return slackUserInfo;
    } catch (error) {
      res
        .status(424)
        .json({
          success: false,
          message: 'User not found. If your are providing a newEmail, it must be the same as the user\'s email on slack'
        });
      throw new Error(error.message);
    }
  }

  
  /**
   * @description Get the user by email from the database
   * @param  {string} email The email of the user on the db
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async getUser(email, res) {
    try {
      const user = await User.findOne({
        where: {
          email
        }
      });

      if (!user) {
        res
          .status(404)
          .json({
            success: false,
            message: 'User not found'
          });
      }
      return user;
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: 'Could not update the user record'
        });
      throw new Error(error.message);
    }
  }

  /**
   * @description Saves the new user record
   * @param  {object} user The user object returned by the database
   * @param  {object} slackUserInfo The information returned from slack on `users.lookupByEmail`
   * @param  {string} newName The new user's name
   * @param  {string} newEmail The new user's email
   * @param  {string} newPhoneNo The new user's phone number
   * @param  {object} res The Http response object
   * @returns {object} The newly updated user info
   */
  static async saveNewRecord(user, slackUserInfo, newName, newEmail, newPhoneNo, res) {
    try {
      const modUser = user;
      modUser.slackId = slackUserInfo.user.id;
      modUser.name = (newName || user.dataValues.name).trim();
      modUser.email = (newEmail || user.dataValues.email).trim();
      modUser.phoneNo = (newPhoneNo || user.dataValues.phoneNo).trim();
      await modUser.save();

      return modUser.dataValues;
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: 'Could not update user record'
        });
      
      throw new Error(error.message);
    }
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
      // Get team details
      const teamDetails = await UsersController.fetchTeamDetails(slackUrl, res);
      // Create the web client from team details
      const web = new WebClient(teamDetails.userToken);
      // Get user's slack Id
      const slackUserInfo = await UsersController.getUserSlackInfo(web, (newEmail || email), res);
      // Get the user info from the database
      let user = await UsersController.getUser(email, res);
      // Save the new record
      user = await UsersController.saveNewRecord(user, slackUserInfo, newName, newEmail, newPhoneNo, res);

      return res
        .status(200)
        .json({
          success: true,
          message: 'User record updated',
          user: {
            name: user.name,
            email: user.email,
            phoneNo: user.phoneNo
          }
        });
    } catch (error) {
      // Handle with bugsnag
      // bugsnag.notify(new Error(error));
    }
  }
}

export default UsersController;
