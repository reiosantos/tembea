import TeamDetailsService from '../../../../services/TeamDetailsService';
import NewSlackHelpers from '../../helpers/slack-helpers';
import DateDialogHelper from '../../../../helpers/dateHelper';
import { userTripPickupSchema } from '../schemas';

export default class Validators {
  static async validatePickUpSubmission(payload) {
    const { submission, user, team } = payload;
    const botToken = await TeamDetailsService.getTeamDetailsBotOauthToken(team.id);
    const userInfo = await NewSlackHelpers.getUserInfo(user.id, botToken);
    submission.dateTime = DateDialogHelper.transformDate(submission.dateTime, userInfo.tz);
    return NewSlackHelpers.dialogValidator(submission, userTripPickupSchema);
  }
}
