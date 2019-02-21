import TeamDetailsService from '../../services/TeamDetailsService';
import UserService from '../../services/UserService';
import TripActionsController from '../slack/TripManagement/TripActionsController';
import GeneralValidator from '../../middlewares/GeneralValidator';
import HttpError from '../../helpers/errorHandler';

class TripsController {
  /**
   * @description Updates the trip status
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async updateTrip(req, res) {
    const { params: { tripId }, query: { action }, body: { comment, slackUrl } } = req;

    const payload = await TripsController.getCommonPayloadParam(req.currentUser, slackUrl, tripId);
    if (action === 'confirm') {
      const {
        driverName, driverPhoneNo, regNumber
      } = req.body;
      const messages = GeneralValidator.validateReqBody(
        req.body,
        'driverName',
        'driverPhoneNo',
        'regNumber',
        'slackUrl'
      );
      if (messages.length) {
        return HttpError.sendErrorResponse({ message: messages }, res);
      }
      payload.submission = {
        confirmationComment: comment, driverName, driverPhoneNo, regNumber
      };

      const result = await TripActionsController.changeTripStatus(payload);
      if (result) { return res.status(200).json({ success: false, message: result.text }); }
      return res.status(200).json({ success: true, message: 'trip confirmed' });
    }
    // TODO // @Fabisch's code
    // if (action === 'decline') {
    //   payload.submission = {
    //     // @Fabisch's format of submission
    //   };
    //   const result = await TripActionsController.changeTripStatus(payload);
    //   if (result) { return res.status(200).json({ success: false, message: response.text }); }
    //   return res.status(200).json({ success: true, message: 'trip confirmed' });
    // }
  }

  static async getSlackIdFromReq(user) {
    const { email } = user;
    // const email = 'paul.soko@andela.com';
    const { slackId: userId } = await UserService.getUserByEmail(email);
    return userId;
  }

  static async getCommonPayloadParam(user, slackUrl, tripId) {
    const userId = await TripsController.getSlackIdFromReq(user);
    const { teamId, opsChannelId } = await TeamDetailsService.getTeamDetailsByTeamUrl(slackUrl);
    const state = JSON.stringify({
      trip: tripId,
      tripId,
      actionTs: '1550735688.001800'
    });
    const payload = {
      submission: {},
      user: { id: userId },
      team: { id: teamId },
      channel: { id: opsChannelId },
      state
    };
    return payload;
  }
}

export default TripsController;
