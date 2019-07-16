import UserTripBookingController from './user/user-trip-booking-controller';
import { userTripActions } from './user/user-trip-helpers';

const userTripRoutes = [
  {
    route: { callbackId: userTripActions.payment },
    handler: UserTripBookingController.paymentRequest
  }
];
export default slackRouter => userTripRoutes.forEach((route) => {
  slackRouter.action(route.route, route.handler);
});
