import * as Joi from '@hapi/joi';
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
    const invalidInputs = Validators.validateDialogSubmission(payload);
    expect(Validators.checkEmpty).toHaveBeenCalled();
    expect(invalidInputs.length).toEqual(0);
  });
  it('should validate inputs with only whitespaces', () => {
    const payload = createPayload();
    const copyPayload = {
      ...payload
    };
    copyPayload.submission.reason = '  ';
    const invalidInputs = Validators.validateDialogSubmission(copyPayload);
    expect(Validators.checkEmpty).toHaveBeenCalled();
    expect(invalidInputs.length).toEqual(1);
  });
});

describe('validate submission', () => {
  it('should return value if valid', () => {
    const data = {
      name: 'Mubarak  ',
      email: '  tester@tembea.com',
      amount: '500',
      paid: 'false'
    };

    const result = Validators.validateSubmission(data, Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().trim().email().required(),
      amount: Joi.number().required(),
      paid: Joi.boolean().required()
    }));

    expect(result.amount).toEqual(500);
  });

  it('should throw an error when validation fails', () => {
    const data = {
      name: 'Mubarak  ',
      email: '  tester@tembea.com'
    };

    try {
      Validators.validateSubmission(data, Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().trim().email().required(),
        amount: Joi.number().required(),
        paid: Joi.boolean().required()
      }));
    } catch (err) {
      expect(err.errors.details.length).toEqual(2);
    }
  });
});
