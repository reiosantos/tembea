import { SlackDialogError } from '../../../modules/slack/SlackModels/SlackDialogModels';

class InputValidator {
  static isEmptySpace(param) {
    return /\s/g.test(param);
  }

  static checkNumberGreaterThanZero(number, fieldName, errorText) {
    return Number(number) > 0 ? [] : [new SlackDialogError(fieldName, `Minimum ${errorText} is 1`)];
  }

  static checkDuplicateFieldValues(fieldOne, fieldTwo, fieldOneName, fieldTwoName) {
    const trimFields = field => field.trim().toLowerCase();
    const errorMessage = `${fieldOneName} and ${fieldTwoName} cannot be the same.`;
    if (trimFields(fieldOne) === trimFields(fieldTwo)) {
      return [
        new SlackDialogError(fieldOneName, errorMessage),
        new SlackDialogError(fieldTwoName, errorMessage)
      ];
    }
    return [];
  }
}

export default InputValidator;
