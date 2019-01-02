import models from '../../database/models';
import HttpError from '../../helpers/errorHandler';
import UserService from '../../services/UserService';

const { User } = models;
class UsersController {
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
      const slackUserInfo = await UserService.getUserInfo(slackUrl, email, newEmail);
      // Get the user info from the database
      let user = await UserService.getUser(email);
      // Save the new record
      user = await UserService.saveNewRecord(
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
        const slackUserInfo = await UserService.getUserInfo(slackUrl, email);
        // Save the new user
        user = await UserService.createNewUser(slackUserInfo);
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

  
  /**
   * @description Read the user records
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async readRecords(req, res) {
    try {
      const size = req.query.size || 100;
      const page = req.query.page || 1;

      const data = await UserService.getUsersFromDB(size, page);
      if (data.rows <= 0) {
        throw new HttpError('There are no records on this page.', 404);
      }

      const totalPages = data.count / size;

      return res.status(200).json({
        success: true,
        message: `${page} of ${Math.ceil(totalPages)} page(s).`,
        users: data.rows
      });
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default UsersController;
