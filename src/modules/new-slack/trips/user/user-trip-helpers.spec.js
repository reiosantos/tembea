import UserTripHelpers from './user-trip-helpers';
import NewSlackHelpers from '../../helpers/slack-helpers';
import tripService from '../../../../services/TripService';

const payload = {
  submission: { price: '200' },
  state: '{"tripId":"16"}'
};
describe('user savePayment helper', () => {
  it('save payment', async () => {
    jest.spyOn(UserTripHelpers, 'savePayment');
    jest.spyOn(NewSlackHelpers, 'dialogValidator');
    jest.spyOn(tripService, 'updateRequest');

    await UserTripHelpers.savePayment(payload);

    expect(NewSlackHelpers.dialogValidator).toHaveBeenCalled();
    expect(tripService.updateRequest).toHaveBeenCalled();
  });
});
