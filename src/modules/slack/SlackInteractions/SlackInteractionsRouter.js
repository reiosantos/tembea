import { createMessageAdapter } from '@slack/interactive-messages';
import SlackInteractions from './index';
import ManagerController from '../RouteManagement/ManagerController';
import OperationsController from '../RouteManagement/OperationsController';
import JoinRouteInteractions from '../RouteManagement/JoinRoute/JoinRouteInteractions';
import RateTripController from '../TripManagement/RateTripController';
import TripInteractions from '../SlackPrompts/notifications/TripNotifications/TripInteractions';

const slackInteractionsRouter = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);

slackInteractionsRouter.action({ callbackId: 'back_to_launch' },
  SlackInteractions.launch);
slackInteractionsRouter.action({ callbackId: 'welcome_message' },
  SlackInteractions.welcomeMessage);
slackInteractionsRouter.action({ callbackId: 'travel_trip_start' },
  SlackInteractions.bookTravelTripStart);
slackInteractionsRouter.action({ callbackId: /^travel_trip/ },
  SlackInteractions.handleTravelTripActions);
slackInteractionsRouter.action({ callbackId: 'book_new_trip' },
  SlackInteractions.bookNewTrip);
slackInteractionsRouter.action({ callbackId: /^schedule_trip/ },
  SlackInteractions.handleUserInputs);
slackInteractionsRouter.action({ callbackId: 'itinerary_actions' },
  SlackInteractions.handleItineraryActions);
slackInteractionsRouter.action({ callbackId: 'reschedule_trip' },
  SlackInteractions.handleReschedule);
slackInteractionsRouter.action({ callbackId: 'approve_trip' },
  SlackInteractions.handleManagerApprovalDetails);
slackInteractionsRouter.action({ callbackId: 'manager_actions' },
  SlackInteractions.handleManagerActions);
slackInteractionsRouter.action({ callbackId: 'decline_trip' },
  SlackInteractions.handleTripDecline);
slackInteractionsRouter.action({ callbackId: 'trip_itinerary' },
  SlackInteractions.viewTripItineraryActions);
slackInteractionsRouter.action({ callbackId: 'operations_approval' },
  SlackInteractions.sendCommentDialog);
slackInteractionsRouter.action({ callbackId: 'operations_reason_dialog' },
  SlackInteractions.handleTripActions);
slackInteractionsRouter.action({ callbackId: 'tembea_route' },
  SlackInteractions.startRouteActions);
slackInteractionsRouter.action({ callbackId: /^new_route/ },
  SlackInteractions.handleRouteActions);
slackInteractionsRouter.action({ callbackId: /^manager_route/ },
  ManagerController.handleManagerActions);
slackInteractionsRouter.action({ callbackId: /^operations_route/ },
  OperationsController.handleOperationsActions);
slackInteractionsRouter.action({ callbackId: 'view_new_trip' },
  SlackInteractions.completeTripResponse);
slackInteractionsRouter.action({ callbackId: /^join_route/ },
  JoinRouteInteractions.handleJoinRouteActions);
slackInteractionsRouter.action({ callbackId: 'rate_trip' },
  RateTripController.rateTrip);
slackInteractionsRouter.action({ callbackId: 'trip_completion' },
  TripInteractions.tripCompleted);
slackInteractionsRouter.action({ callbackId: 'trip_not_taken' },
  TripInteractions.resonForNotTakingTrip);

export default slackInteractionsRouter;
