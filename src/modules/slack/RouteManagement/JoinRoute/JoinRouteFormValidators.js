import Validators from '../../../../helpers/slack/UserInputValidator/Validators';
import ManagerFormValidator from
  '../../../../helpers/slack/UserInputValidator/managerFormValidator';
import DateDialogHelper, { validateTime } from '../../../../helpers/dateHelper';
import { SlackDialogError } from '../../SlackModels/SlackDialogModels';
import cache from '../../../../cache';

class FormValidators {
  static validateWorkHours(workHours) {
    const errors = [];
    const validHours = workHours.includes('-') ? workHours.split('-') : false;
    if (!validHours) {
      errors.push(new SlackDialogError(
        'workHours', 'Work hours should be in the format hh:mm - hh:mm. See hint.'
      ));
    } else {
      errors.push(...this.validateHours(validHours));
    }
    return errors;
  }

  static validateHours(validHours) {
    const errors = [];
    let [from, to] = validHours;
    from = validateTime(from.trim());
    to = validateTime(to.trim());
    if (!(to && from)) {
      errors.push(new SlackDialogError('workHours', 'Invalid time.'));
    }
    return errors;
  }

  static async validateFellowDetailsForm({
    submission: {
      workHours
    },
    user: {
      id
    }
  }) {
    const [startDate, endDate, partnerName] = await cache.fetch(`userDetails${id}`);
    const start = DateDialogHelper.changeDateTimeFormat(startDate);
    const end = DateDialogHelper.changeDateTimeFormat(endDate);
    const errors = [];
    errors.push(
      ...Validators.checkEmpty(partnerName, 'partnerName'),
      ...this.validateWorkHours(workHours),
      ...ManagerFormValidator.validateEngagementDate(start, end)
    );
    return errors;
  }
}

export default FormValidators;
