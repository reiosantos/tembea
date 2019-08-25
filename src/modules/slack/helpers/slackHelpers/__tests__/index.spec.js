import TeamDetailsService from '../../../../../services/TeamDetailsService';
import SlackHelpers from '../SlackInteractionsHelpers';
import OpsTripActions from '../../../TripManagement/OpsTripActions';
import OpsDialogPrompts from '../../../SlackPrompts/OpsDialogPrompts';
import SlackInteractions from '../../../SlackInteractions';
import tripService from '../../../../../services/TripService';

describe('SlackHelpers', () => {
  describe('handleOpsSelectAction', () => {
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockReturnValue('token');
    jest.spyOn(OpsTripActions, 'sendUserCancellation').mockReturnValue({});
    jest.spyOn(OpsDialogPrompts, 'selectDriverAndCab').mockResolvedValue({});
    jest.spyOn(SlackInteractions, 'handleSelectProviderAction').mockReturnValue({});

    it('should send  User Cancellation notification', async () => {
      jest.spyOn(tripService, 'getById').mockReturnValue({ tripStatus: 'Cancelled' });
      await SlackHelpers.handleOpsSelectAction('Cancelled', 1, 'TEAM', 'UGHA',
        2, '1223453', {}, {}, jest.fn());
      expect(OpsTripActions.sendUserCancellation).toBeCalled();
    });

    it('should send selectDriverAndCab dialog', async () => {
      jest.spyOn(tripService, 'getById').mockReturnValue({ tripStatus: 'Confirmed' });
      await SlackHelpers.handleOpsSelectAction('assignCab', 1, 'TEAM', 'UGHA',
        2, '1223453', {}, {}, jest.fn());
      expect(OpsDialogPrompts.selectDriverAndCab).toBeCalled();
    });

    it('should call handle Select ProviderAction', async () => {
      jest.spyOn(tripService, 'getById').mockReturnValue({ tripStatus: 'Confirmed' });
      await SlackHelpers.handleOpsSelectAction('assignProvider', 1, 'TEAM', 'UGHA',
        2, '1223453', {}, { actions: [{ id: 1 }] }, jest.fn());
      expect(SlackInteractions.handleSelectProviderAction).toBeCalled();
    });
  });
});
