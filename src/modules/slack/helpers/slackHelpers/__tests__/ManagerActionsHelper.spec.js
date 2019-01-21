import DialogPrompts from '../../../SlackPrompts/DialogPrompts';
import ManagerActionsHelper from '../ManagerActionsHelper';
import SlackHelpers from '../../../../../helpers/slack/slackHelpers';
import SlackInteractions from '../../../SlackInteractions';

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
  
  it('should handle manager decline', async (done) => {
    jest.spyOn(DialogPrompts, 'sendDialogToManager').mockImplementation().mockResolvedValue({});
    await ManagerActionsHelper.managerDecline(payload);
    expect(DialogPrompts.sendDialogToManager).toHaveBeenCalled();
    done();
  });

  it('should handle manager approve', async (done) => {
    const respond = jest.fn();
    jest.spyOn(SlackHelpers, 'isRequestApproved').mockImplementation().mockResolvedValue('mockedTrip');
    jest.spyOn(SlackInteractions, 'approveTripRequestByManager').mockImplementation().mockReturnValue({});
    await ManagerActionsHelper.managerApprove(payload, respond);
    expect(SlackHelpers.isRequestApproved).toHaveBeenCalled();
    expect(SlackInteractions.approveTripRequestByManager).toHaveBeenCalled();

    done();
  });
});
