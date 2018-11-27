import { createMessageAdapter } from '@slack/interactive-messages';
import SlackInteractions from './index';

const slackInteractionsRouter = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);

slackInteractionsRouter.action({ callbackId: 'back_to_launch' },
  SlackInteractions.launch);
slackInteractionsRouter.action({ callbackId: 'welcome_message' },
  SlackInteractions.welcomeMessage);
slackInteractionsRouter.action({ callbackId: 'book_new_trip' },
  SlackInteractions.bookNewTrip);
slackInteractionsRouter.action({ callbackId: 'schedule_trip_form' },
  SlackInteractions.handleUserInputs);
slackInteractionsRouter.action({ callbackId: 'itinerary_actions' },
  SlackInteractions.handleItineraryActions);
slackInteractionsRouter.action({ callbackId: 'reschedule_trip' },
  SlackInteractions.handleReschedule);
slackInteractionsRouter.action({ callbackId: 'manager_action' },
  SlackInteractions.handleManagerDecline);
slackInteractionsRouter.action({ callbackId: 'decline_trip' },
  SlackInteractions.handleTripDecline);

export default slackInteractionsRouter;
