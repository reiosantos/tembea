import { SlackDialog } from '../../../SlackModels/SlackDialogModels';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import WebClientSingleton from '../../../../../utils/WebClientSingleton';
import JoinRouteDialogPrompts from '../JoinRouteDialogPrompts';
import slackService from '../../../../../helpers/slack/slackHelpers';
import AisService from '../../../../../services/AISService';

jest.mock('../../../../../helpers/slack/slackHelpers');
jest.mock('../../../../../services/AISService');

describe('JoinRouteDialogPrompts', () => {
  let fellowdata = null;
  let AISData = null;

  const data = { profile: { email: 'testmail@test.com' } };
  const userData = {
    placement:
    { start_date: '2017-11-13T15:33:24.140Z', end_date: '', client: 'testClient' }
  };

  beforeEach(() => {
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken')
      .mockResolvedValue('token');
    fellowdata = jest.spyOn(slackService, 'getUserInfoFromSlack').mockResolvedValue(data);
    AISData = jest.spyOn(AisService, 'getUserDetails').mockResolvedValue(userData);
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('sendFellowDetailsForm', () => {
    it('should call sendDialogTryCatch', async () => {
      const payload = { trigger_id: 'triggerId', team: { id: 'teamId' }, user: { id: 'userId' } };
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
      expect(AISData).toBeCalled();
      expect(fellowdata).toBeCalledWith('userId', 'teamId');
    });
  });
});
