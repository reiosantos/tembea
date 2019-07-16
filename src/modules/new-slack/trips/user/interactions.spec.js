import Interactions from './interactions';
import { DialogPrompts, Cache } from '../../../slack/RouteManagement/rootFile';
import UpdateSlackMessageHelper from '../../../../helpers/slack/updatePastMessageHelper';
import { userTripDetails } from './user-data-mocks';
import UserTripHelpers from './user-trip-helpers';
import { getTripKey } from '../../../../helpers/slack/ScheduleTripInputHandlers';

describe('Interactions', () => {
  let payload;
  let state;
  let dialogSpy;

  beforeEach(() => {
    payload = { user: { id: 'U1567' } };
    state = { origin: 'https;//github.com' };
    dialogSpy = jest.spyOn(DialogPrompts, 'sendDialog').mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('sendTripReasonForm', () => {
    it('should send trip reason form', async () => {
      await Interactions.sendTripReasonForm(payload, state);

      expect(dialogSpy).toHaveBeenCalledTimes(1);
      expect(dialogSpy).toHaveBeenCalledWith((expect.objectContaining({
        title: 'Reason for booking trip',
        submit_label: 'Submit'
      })), payload);
    });
  });

  describe('sendDetailsForm', () => {
    it('should send details form', async () => {
      const details = {
        title: 'pickup details',
        submitLabel: 'Submit',
        callbackId: 'id',
        fields: 'fields'
      };
      await Interactions.sendDetailsForm(payload, state, details);
      expect(dialogSpy).toHaveBeenCalledTimes(1);
      expect(dialogSpy).toHaveBeenCalledWith((expect.objectContaining({
        title: 'pickup details',
        submit_label: 'Submit'
      })), payload);
    });
  });

  describe('sendPostDestinationMessage, sendPostPickupMessage', () => {
    const newPayload = {
      submission: {
        pickup: 'Nairobi',
        othersPickup: null,
        dateTime: '22/12/2019 22:00'
      },
      team: {
        id: 'HGYYY667'
      },
      user: {
        id: 'HUIO56LO'
      },
      state: '{ "origin": "https://origin.com"}'
    };

    beforeEach(() => {
      jest.spyOn(UpdateSlackMessageHelper, 'newUpdateMessage').mockResolvedValue();
    });

    it('should send post destination message', async () => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue(userTripDetails);
      jest.spyOn(UserTripHelpers, 'getLocationVerificationMsg').mockResolvedValue({});
      await Interactions.sendPostDestinationMessage(newPayload);
      expect(Cache.fetch).toHaveBeenCalledWith(getTripKey(payload.user.id));
      expect(UpdateSlackMessageHelper.newUpdateMessage).toHaveBeenCalled();
    });

    it('should send post pickup message', async () => {
      await Interactions.sendPostPickUpMessage(newPayload);
      expect(UpdateSlackMessageHelper.newUpdateMessage).toHaveBeenCalled();
    });
  });
});
