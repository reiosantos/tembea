import slackService from '../../../../helpers/slack/slackHelpers';
import AisService from '../../../../services/AISService';
import {
  getFellowEngagementDetails, FormHandler, dateProcessor, dateFaker
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

  describe('FormHandler', () => {
    it('should getUserDetails', async () => {
      dateProcessor.prototype = jest.fn().mockReturnValue(fullUserData.placement.start_date);

      const startDate = await new FormHandler('').getStartDate();
      expect(startDate).toEqual('01/01/2019');
    });
    it('should getEndDate', async () => {
      dateProcessor.prototype = jest.fn().mockReturnValue(fullUserData.placement.start_date);
      dateFaker.prototype = jest.fn().mockReturnValue(fullUserData.placement.start_date);
      const formData = new FormHandler('');
      formData.dateProcessor = jest.fn();
      formData.dateProcessor.mockImplementation((date) => {
        jest.spyOn(date, 'split').mockResolvedValue();
        return fullUserData.placement.start_date;
      });
      formData.userData = fullUserData;
      const startDate = await formData.getEndDate();
      expect(startDate).toEqual('13/11/2021');
    });
    it('should getEndDate error not placed', async () => {
      dateFaker.prototype = jest.fn().mockReturnValue(fullUserData.placement.start_date);
      const formData = new FormHandler('');
      formData.userData = { placement: null };
      const endDate = await formData.getEndDate();
      expect(endDate).toEqual('01/01/2023');
    });
    it('should getPartnerStatus', async () => {
      const formData = new FormHandler('');
      formData.userData = fullUserData;
      const getPartnerStatus = await formData.getPartnerStatus();
      expect(getPartnerStatus).toEqual('testClient');
    });
    it('should fail getPartnerStatus', async () => {
      const formData = new FormHandler('');
      formData.userData = null;
      const getPartnerStatus = await formData.getPartnerStatus();
      expect(getPartnerStatus).toEqual('--');
    });
    it('should check isFellowOnEngagement expect true', async () => {
      const formData = new FormHandler('');
      formData.userData = { placement: { status: 'External Engagements blablabla' } };
      const isFellowOnEngagement = formData.isFellowOnEngagement();
      expect(isFellowOnEngagement).toEqual(true);
    });
    it('should check isFellowOnEngagement expect false', async () => {
      const formData = new FormHandler('');
      formData.userData = { placement: { status: 'External blablabla' } };
      const isFellowOnEngagement = formData.isFellowOnEngagement();
      expect(isFellowOnEngagement).toEqual(false);
    });
  });
  describe('getFellowEngagementDetails', () => {
    it('should fetch data from the slack helpers class', async () => {
      FormHandler.prototype.getStartDate = jest.fn().mockReturnValue(true);
      FormHandler.prototype.getEndDate = jest.fn().mockReturnValue(true);
      FormHandler.prototype.getPartnerStatus = jest.fn().mockReturnValue(true);
      FormHandler.prototype.isFellowOnEngagement = jest.fn().mockReturnValue(true);

      await getFellowEngagementDetails(userId, teamId);
      expect(oldFellowData).toBeCalledWith(200, 1000);
      expect(newFellowData).toBeCalledWith(200, 1000);
      expect(maxAISData).toBeCalledWith('testmail@test.com');
      expect(minAISData).toBeCalledWith('testmail@test.com');
    });
    it('should not fetch data for fellow not on external engagement', async () => {
      FormHandler.prototype.getStartDate = jest.fn().mockReturnValue(true);
      FormHandler.prototype.getEndDate = jest.fn().mockReturnValue(true);
      FormHandler.prototype.getPartnerStatus = jest.fn().mockReturnValue(true);
      FormHandler.prototype.isFellowOnEngagement = jest.fn().mockReturnValue(false);

      await getFellowEngagementDetails(userId, teamId);
      expect(oldFellowData).toBeCalledWith(200, 1000);
      expect(newFellowData).toBeCalledWith(200, 1000);
      expect(maxAISData).toBeCalledWith('testmail@test.com');
      expect(minAISData).toBeCalledWith('testmail@test.com');
    });
  });
});
