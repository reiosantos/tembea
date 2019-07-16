import Validators from '../../../helpers/slack/UserInputValidator/Validators';
import {
  SlackDialogError,
} from '../../slack/SlackModels/SlackDialogModels';

export default class NewSlackHelpers {
  static dialogValidator(data, schema) {
    try {
      const results = Validators.validateSubmission(data, schema);
      return results;
    } catch (err) {
      const error = new Error('dialog validation failed');
      error.errors = err.errors.details.map((e) => {
        const key = e.path[0];
        return new SlackDialogError(key,
          e.message || 'the submitted property for this value is invalid');
      });
      throw error;
    }
  }
}
