import createDialogForm from '../index';
import createTripDetailsForm from '../../createTripDetailsForm';
import {
  SlackDialogModel
} from '../../../../modules/slack/SlackModels/SlackDialogModels';

describe('createDialogForm tests', () => {
  it('should test that new dialog is created', () => {
    const createTripDetailsFormHandler = jest
      .spyOn(createTripDetailsForm, 'regularTripForm')
      .mockImplementation(() => {});

    const dialogForm = createDialogForm('payload', 'regularTripForm', 'someCallbackId');

    expect(createTripDetailsFormHandler).toBeCalled();
    expect(dialogForm instanceof SlackDialogModel).toBeTruthy();
  });
});
