import UserTripHelpers from './user-trip-helpers';
import UserTripBookingController from './user-trip-booking-controller';

describe('paymentRequest', () => {
  it('save payment request', async () => {

    const [payload, res] = [{
      submission: {
        price: 300
      },
      user: {
        // tz_offset: 3600,
        id: 'UIS233'
      },
      team: { id: 'UIS233' },
      response_url: 'http://url.com'
    }, jest.fn()];

    jest.spyOn(UserTripHelpers, 'savePayment');
    await UserTripBookingController.paymentRequest(payload, res);

    expect(UserTripHelpers.savePayment).toHaveBeenCalled();
  });
})
