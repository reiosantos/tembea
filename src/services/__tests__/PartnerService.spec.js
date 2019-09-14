import PartnerService from '../PartnerService';
import models from '../../database/models';
import { engagement, updateEngagement } from '../__mocks__';

const { Partner, Engagement } = models;

describe('Partner Service', () => {
  let partnerFindOrCreate;
  let engagementFindOrCreate;
  let engagementFindByPk;
  beforeEach(() => {
    partnerFindOrCreate = jest.spyOn(Partner, 'findOrCreate');
    engagementFindOrCreate = jest.spyOn(Engagement, 'findOrCreate');
    engagementFindByPk = jest.spyOn(Engagement, 'findByPk');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it('should create partner', async () => {
    const name = 'AAAAAA';
    partnerFindOrCreate.mockResolvedValue([{ name }]);
    const result = await PartnerService.findOrCreatePartner();
    expect(partnerFindOrCreate)
      .toHaveBeenCalled();
    expect(result)
      .toEqual({ name });
  });
  it('should create engagement', async () => {
    const {
      startDate, endDate, workHours, fellow, partner, fellowId, partnerId
    } = engagement;
    engagementFindOrCreate.mockResolvedValue([engagement]);
    const result = await PartnerService.findOrCreateEngagement(
      workHours, fellow, partner, startDate, endDate
    );
    expect(engagementFindOrCreate)
      .toHaveBeenCalled();
    expect(engagementFindOrCreate.mock.calls[0][0].where)
      .toEqual({
        fellowId,
        partnerId
      });
    expect(result)
      .toEqual(engagement);
  });

  it('should update engagement', async () => {
    const { startDate, endDate, workHours, } = updateEngagement;
    const update = jest.fn();
    engagementFindByPk.mockResolvedValue({
      ...updateEngagement,
      update
    });
    const result = await PartnerService
      .updateEngagement(updateEngagement.id, updateEngagement);

    expect(engagementFindByPk)
      .toHaveBeenCalled();
    expect(update.mock.calls[0][0])
      .toEqual({
        startDate,
        endDate,
        workHours
      });
    expect(result)
      .toEqual({
        ...updateEngagement,
        update
      });
  });
  it('should get engagement', async () => {
    engagementFindByPk.mockResolvedValue({
      ...engagement,
    });
    const result = await PartnerService.getEngagement(engagement.id);
    expect(engagementFindByPk)
      .toHaveBeenCalled();
    expect(result)
      .toEqual(engagement);
  });
});
