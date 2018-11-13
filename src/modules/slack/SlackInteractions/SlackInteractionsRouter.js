import { createMessageAdapter } from '@slack/interactive-messages';
import SlackInteractions from './index';

const slackInteractionsRouter = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);

slackInteractionsRouter.action({ callbackId: 'welcome_message' },
  SlackInteractions.welcomeMessage);
slackInteractionsRouter.action({ callbackId: 'book_new_trip' },
  SlackInteractions.bookNewTrip);
slackInteractionsRouter.action({ callbackId: 'schedule_trip_form' },
  SlackInteractions.handleUserInputs);
slackInteractionsRouter.action({ callbackId: 'trip_itinerary' },
  SlackInteractions.handleItinerary);
slackInteractionsRouter.action({ callbackId: 'reschedule_trip' },
  SlackInteractions.handleReschedule);


export default slackInteractionsRouter;
