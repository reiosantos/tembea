import TripDetailsService from '../TripDetailsService';
import models from '../../database/models';

const { TripDetail } = models;

describe('Test TripDetailsService', () => {
  const tripDetail = {
    riderPhoneNo: '0781234567',
    travelTeamPhoneNo: '0781234567',
    flightNumber: '9AA09'
  };
  beforeEach(() => {
    jest.spyOn(TripDetail, 'create').mockResolvedValue(tripDetail);
  });
  it('should test that trip detail is created', async () => {
    const trip = await TripDetailsService.createDetails(tripDetail);
    expect(TripDetail.create).toBeCalled();
    expect(trip).toEqual(tripDetail);
  });
});
