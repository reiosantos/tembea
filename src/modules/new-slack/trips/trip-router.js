import UserTripBookingController from './user/user-trip-booking-controller';
import userTripActions from './user/actions';
import userTripBlocks from './user/blocks';

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
    route: { callbackId: userTripActions.reasonDialog },
    handler: UserTripBookingController.handleReasonSubmit
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
    route: { callbackId: userTripActions.pickupDialog },
    handler: UserTripBookingController.savePickupDetails
  },
  {
    route: { actionId: userTripActions.sendDest, blockId: userTripBlocks.getDestFields },
    handler: UserTripBookingController.sendDestinations
  },
  {
    route: { callbackId: userTripActions.destDialog },
    handler: UserTripBookingController.saveDestination
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
  {
    route: { callbackId: userTripActions.payment },
    handler: UserTripBookingController.paymentRequest
  }
];

export default slackRouter => userTripRoutes.forEach((route) => {
  slackRouter.action(route.route, route.handler);
});
