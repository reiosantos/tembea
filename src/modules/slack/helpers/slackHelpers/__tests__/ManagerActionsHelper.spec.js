import DialogPrompts from '../../../SlackPrompts/DialogPrompts';
import ManagerActionsHelper from '../ManagerActionsHelper';
import SlackHelpers from '../../../../../helpers/slack/slackHelpers';
import SlackInteractionsHelpers from '../SlackInteractionsHelpers';

describe('ManagerActionsHelper', () => {
  let payload;

  beforeEach(() => {
    payload = {
      actions: [{
        value: 'test_value'
      }],
      channel: { id: 2 },
      original_message: { ts: 'dsfdf' },
      user: { id: 3 }
    };
  });
  
  it('should handle manager decline', async () => {
    jest.spyOn(DialogPrompts, 'sendReasonDialog').mockImplementation().mockResolvedValue({});
    await ManagerActionsHelper.managerDecline(payload);
    expect(DialogPrompts.sendReasonDialog).toHaveBeenCalled();
  });

  it('should handle manager approve', async () => {
    const respond = jest.fn();
    jest.spyOn(SlackHelpers, 'isRequestApproved').mockImplementation().mockResolvedValue('mockedTrip');
    jest.spyOn(SlackInteractionsHelpers, 'approveTripRequestByManager').mockImplementation().mockReturnValue({});
    await ManagerActionsHelper.managerApprove(payload, respond);
    expect(SlackHelpers.isRequestApproved).toHaveBeenCalled();
    expect(SlackInteractionsHelpers.approveTripRequestByManager).toHaveBeenCalled();
  });
});
