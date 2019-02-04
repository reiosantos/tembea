import { SlackDialog } from '../../../SlackModels/SlackDialogModels';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import WebClientSingleton from '../../../../../utils/WebClientSingleton';
import JoinRouteDialogPrompts from '../JoinRouteDialogPrompts';

describe('JoinRouteDialogPrompts', () => {
  beforeEach(() => {
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken')
      .mockResolvedValue('token');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('sendFellowDetailsForm', () => {
    it('should call sendDialogTryCatch', async () => {
      const payload = { trigger_id: 'triggerId', team: { id: 'teamId' } };
      const addElementsSpy = jest.spyOn(SlackDialog.prototype, 'addElements');
      const webSpy = jest.spyOn(WebClientSingleton.prototype, 'getWebClient')
        .mockImplementation(() => ({
          dialog: {
            open: jest.fn()
          }
        }));
      await JoinRouteDialogPrompts.sendFellowDetailsForm(payload, 2);
      expect(addElementsSpy).toBeCalledTimes(1);
      expect(webSpy).toBeCalled();
    });
  });
});
