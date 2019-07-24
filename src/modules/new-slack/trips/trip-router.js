import UserTripBookingController from './user/user-trip-booking-controller';
import userTripActions from './user/actions';
import userTripBlocks from './user/blocks';
import CustomSlackRouter from './custom-slack-router';

const userTripRoutes = [
  {
    route: { actionId: userTripActions.forMe, blockId: userTripBlocks.start },
    handler: UserTripBookingController.forMe
  },
  {
    route: { actionId: userTripActions.forSomeone, blockId: userTripBlocks.start },
    handler: UserTripBookingController.forMe
  },
  {
    route: { actionId: userTripActions.back, blockId: userTripBlocks.navBlock },
    handler: UserTripBookingController.back
  },
  {
    route: { actionId: userTripActions.cancel, blockId: userTripBlocks.navBlock },
    handler: UserTripBookingController.cancel
  },
  {
    route: { actionId: userTripActions.setPassenger, blockId: userTripBlocks.setRider },
    handler: UserTripBookingController.saveRider
  },
  {
    route: {
      actionId: userTripActions.addExtraPassengers,
      blockId: userTripBlocks.addPassengers
    },
    handler: UserTripBookingController.saveExtraPassengers
  },
  {
    route: {
      actionId: userTripActions.noPassengers,
      blockId: userTripBlocks.addPassengers
    },
    handler: UserTripBookingController.saveExtraPassengers
  },
  {
    route: {
      // actionId: new RegExp(`/^\`${userTripActions.getDepartment}`),
      blockId: userTripBlocks.selectDepartment
    },
    handler: UserTripBookingController.saveDepartment
  },
  {
    route: { actionId: userTripActions.sendDest, blockId: userTripBlocks.getDestFields },
    handler: UserTripBookingController.sendDestinations
  },
  {
    route: {
      // actionId: userTripActions.selectPickupLocation || userTripActions.selectDestinationLocation,
      blockId: userTripBlocks.confirmLocation
    },
    handler: UserTripBookingController.confirmLocation
  },
  {
    route: { actionId: userTripActions.confirmTripRequest, blockId: userTripBlocks.confirmTrip },
    handler: UserTripBookingController.confirmTripRequest
  },
  {
    route: { actionId: userTripActions.cancelTripRequest, blockId: userTripBlocks.confirmTrip },
    handler: UserTripBookingController.cancel
  },
];

export default (slackRouter) => {
  const handler = new CustomSlackRouter();
  userTripRoutes.forEach((route) => {
    handler.use(route.route, route.handler);
  });
  slackRouter.action({ actionId: /^__/ }, (payload, respond) => {
    handler.handle(payload, respond);
  });
};
