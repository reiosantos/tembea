import FormValidators from '../JoinRouteFormValidators';
import { SlackDialogError } from '../../../SlackModels/SlackDialogModels';
import DateDialogHelper from '../../../../../helpers/dateHelper';
import cache from '../../../../../cache';
import Validators from '../../../../../helpers/slack/UserInputValidator/Validators';

describe('FormValidators: validateFellowDetailsForm()', () => {
  const submission = {
    workHours: '18:00-00:00'
  };
  const user = {
    id: 'UHX123DR',
    name: 'John Doe'
  };
  const cacheValues = ['12/01/2018', '12/01/2022', 'Mastercard'];
  beforeEach(() => {
    jest.spyOn(DateDialogHelper, 'changeDateTimeFormat');
    jest.spyOn(Validators, 'checkEmpty');
    jest.spyOn(FormValidators, 'validateWorkHours');
    jest.spyOn(cache, 'fetch').mockResolvedValue(cacheValues);
  });
  it('should return an empty list if no errors are found', async () => {
    const data = { submission, user };
    const result = await FormValidators.validateFellowDetailsForm(data);
    expect(DateDialogHelper.changeDateTimeFormat).toHaveBeenCalledWith(cacheValues[0]);
    expect(DateDialogHelper.changeDateTimeFormat).toHaveBeenCalledWith(cacheValues[1]);
    expect(Validators.checkEmpty).toHaveBeenCalled();
    expect(FormValidators.validateWorkHours).toHaveBeenCalledWith(submission.workHours);
    expect(result).toEqual([]);
  });
  it('should return a list of errors if time format is not hh:mm-hh:mm', async () => {
    const data = { submission: { workHours: 'a random string' }, user: { ...user } };
    const result = await FormValidators.validateFellowDetailsForm(data);
    const error = new SlackDialogError(
      'workHours', 'Work hours should be in the format hh:mm - hh:mm. See hint.'
    );
    expect(result).toEqual([error]);
  });
  it('should return a list of errors if time is invalid', async () => {
    const data = { submission: { workHours: '18:00-30:00' }, user: { ...user } };
    const result = await FormValidators.validateFellowDetailsForm(data);
    const error = new SlackDialogError('workHours', 'Invalid time.');
    expect(result).toEqual([error]);
  });
});
