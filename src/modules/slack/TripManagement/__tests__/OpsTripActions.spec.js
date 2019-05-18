import OpsTripActions from '../OpsTripActions';
import InteractivePromptsHelpers from '../../helpers/slackHelpers/InteractivePromptsHelpers';
import { InteractivePrompts } from '../../RouteManagement/rootFile';

describe('sendUserCancellation', () => {
  it('Should send user cancellation update', async () => {
    const [channel, botToken, trip, userId, timeStamp] = ['operations', 'xyz098', {}, '123409864'];
    jest.spyOn(InteractivePromptsHelpers, 'addOpsNotificationTripFields').mockResolvedValue({});
    const messageUpdateSpy = jest.spyOn(InteractivePrompts, 'messageUpdate');

    await OpsTripActions.sendUserCancellation(channel, botToken, trip, userId, timeStamp);
    expect(messageUpdateSpy).toHaveBeenCalled();
  });
});
