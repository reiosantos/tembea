import FormValidators from '../JoinRouteFormValidators';
import { SlackDialogError } from '../../../SlackModels/SlackDialogModels';

describe('FormValidators: validateFellowDetailsForm()', () => {
  const submission = {
    partnerName: 'partner',
    workHours: '18:00-00:00',
    startDate: '12/12/2019',
    endDate: '12/12/2020'
  };
  it('should return an empty list if no errors are found', () => {
    const data = { submission };
    const result = FormValidators.validateFellowDetailsForm(data);
    expect(result).toEqual([]);
  });
  it('should return a list of errors if white spaces are passed', () => {
    const data = {
      submission: {
        ...submission, startDate: '  ', endDate: '  ', partnerName: '  '
      }
    };
    const result = FormValidators.validateFellowDetailsForm(data);
    expect(result.length).toEqual(3);
  });
  it('should return a list of errors if start date is greater or equal to end date', () => {
    const data = { submission: { ...submission, endDate: '12/12/2019' } };
    const result = FormValidators.validateFellowDetailsForm(data);
    expect(result.length).toEqual(1);
  });
  it('should return a list of errors if wrong date format is entered', () => {
    const data = { submission: { ...submission, endDate: 'end', startDate: 'start' } };
    const result = FormValidators.validateFellowDetailsForm(data);
    expect(result.length).toEqual(2);
  });
  it('should return a list of errors if time format is not hh:mm-hh:mm', () => {
    const data = { submission: { ...submission, workHours: 'wrong format' } };
    const result = FormValidators.validateFellowDetailsForm(data);
    const error = new SlackDialogError(
      'workHours', 'Work hours should be in the format hh:mm - hh:mm. See hint.'
    );
    expect(result).toEqual([error]);
  });
  it('should return a list of errors if time is invalid', () => {
    const data = { submission: { ...submission, workHours: '18:00-30:00' } };
    const result = FormValidators.validateFellowDetailsForm(data);
    const error = new SlackDialogError('workHours', 'Invalid time.');
    expect(result).toEqual([error]);
  });
});
