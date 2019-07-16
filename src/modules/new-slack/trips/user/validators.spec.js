import TeamDetailsService from '../../../../services/TeamDetailsService';
import NewSlackHelpers from '../../helpers/slack-helpers';
import UserTripHelpers from './user-trip-helpers';
import Validators from './validators';

describe('Validators', () => {
  const payload = {
    submission: {
      pickup: 'Nairobi',
      othersPickup: null,
      dateTime: '22/12/2019 22:00'
    },
    team: {
      id: 'HGYYY667'
    },
    user: {
      id: 'HUIO56LO'
    },
    state: '{ "origin": "https://origin.com"}'
  };
  
  describe('validatePickUpSubmission', () => {
    it('should validate pickup submission successfully', async () => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('botToken');
      jest.spyOn(NewSlackHelpers, 'getUserInfo').mockResolvedValue({ tz: 'America/Los_Angeles' });
      await Validators.validatePickUpSubmission(payload);
      expect(TeamDetailsService.getTeamDetailsBotOauthToken).toHaveBeenCalled();
      expect(NewSlackHelpers.getUserInfo).toHaveBeenCalledWith(payload.user.id, 'botToken');
    });
  });
});
