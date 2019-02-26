import slackService from '../../../../helpers/slack/slackHelpers';
import AisService from '../../../../services/AISService';
import {
  FormData // , FormHandler, dateFaker, dateProcessor
} from '../formHelper';

describe('it should return fellows data as expected', () => {
  let oldFellowData = null;
  let newFellowData = null;
  let maxAISData = null;
  let minAISData = null;
  const data = { profile: { email: 'testmail@test.com' } };
  const fullUserData = {
    placement:
    { start_date: '2017-11-13T15:33:24.140Z', end_date: '', client: 'testClient' }
  };
  const missingUserData = {
    data: 'new felloe'
  };

  const userId = 200;
  const teamId = 1000;

  beforeEach(() => {
    oldFellowData = jest.spyOn(slackService, 'getUserInfoFromSlack').mockResolvedValue(data);
    newFellowData = jest.spyOn(slackService, 'getUserInfoFromSlack').mockResolvedValue(data);
    maxAISData = jest.spyOn(AisService, 'getUserDetails').mockResolvedValue(fullUserData);
    minAISData = jest.spyOn(AisService, 'getUserDetails').mockResolvedValue(missingUserData);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('Get the users data from slack', () => {
    it('should fetch data from the slack helpers class', async () => {
      await FormData(userId, teamId);
      expect(oldFellowData).toBeCalledWith(200, 1000);
      expect(newFellowData).toBeCalledWith(200, 1000);
      expect(maxAISData).toBeCalledWith('testmail@test.com');
      expect(minAISData).toBeCalledWith('testmail@test.com');
    });
  });
});
