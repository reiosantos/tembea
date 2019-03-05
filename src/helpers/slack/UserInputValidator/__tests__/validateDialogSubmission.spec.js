import validateDialogSubmission from '../validateDialogSubmission';
import {
  createPayload
} from '../../../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';
import Validators from '../Validators';

describe('Validates Dialog Submission Inputs', () => {
  beforeEach(() => {
    jest.spyOn(Validators, 'checkEmpty');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate inputs with valid data', () => {
    const payload = createPayload();
    const invalidInputs = validateDialogSubmission(payload);
    expect(Validators.checkEmpty).toHaveBeenCalled();
    expect(invalidInputs.length).toEqual(0);
  });
  it('should validate inputs with only whitespaces', () => {
    const payload = createPayload();
    const copyPayload = {
      ...payload
    };
    copyPayload.submission.reason = '  ';
    const invalidInputs = validateDialogSubmission(copyPayload);
    expect(Validators.checkEmpty).toHaveBeenCalled();
    expect(invalidInputs.length).toEqual(1);
  });
});
