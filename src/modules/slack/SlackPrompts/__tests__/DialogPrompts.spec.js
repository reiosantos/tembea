import DialogPrompts from '../DialogPrompts';
import sendDialogTryCatch from '../../../../helpers/sendDialogTryCatch';
import createTripDetailsForm from '../../../../helpers/slack/createTripDetailsForm';

jest.mock('../../../../services/TeamDetailsService', () => ({
  getTeamDetailsBotOauthToken: async () => 'just a random token'
}));

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../../../helpers/sendDialogTryCatch', () => jest.fn());

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    dialog: {
      open: jest.fn(() => Promise.resolve({
        status: true
      }))
    }
  }))
}));

describe('Dialog prompts test', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should test sendTripDetailsForm function when forSelf is false', async (done) => {
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripDetailsForm(payload, 'false');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendTripDetailsForm function when forSelf is true', async (done) => {
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripDetailsForm(payload, 'true');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendRescheduleTripForm function', async (done) => {
    const payload = { callback_id: 'calling', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendRescheduleTripForm(payload, 'call', 'state', 'dialog');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendTripReasonForm function', async (done) => {
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripReasonForm(payload);
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendCommentDialog function', async (done) => {
    await DialogPrompts.sendOperationsDeclineDialog({
      message_ts: 'trigger',
      actions: ['value', ''],
      team: { id: 'TEAMID1' }
    });
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendOperationsApprovalDialog function', async (done) => {
    await DialogPrompts.sendOperationsApprovalDialog({
      actions: ['value', ''],
      trigger_id: 'trigger',
      channel: {
        id: 'XXXXXXXX'
      },
      team: { id: 'TEAMID1' }
    });

    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });
});

describe('Decline dialog', () => {
  it('should send decline dialog', async (done) => {
    await DialogPrompts.sendDialogToManager({
      trigger_id: 'XXXXXXX',
      team: { id: 'TEAMID1' }
    },
    'callback_id',
    'state',
    'dialogName');

    expect(sendDialogTryCatch).toBeCalled();
    done();
  });
});

describe('Test Travel Details Dialogues', () => {
  beforeEach(() => {
    createTripDetailsForm.travelTripContactDetailsForm = jest.fn(() => ({ dialog: 'yay' }));
    createTripDetailsForm.travelTripFlightDetailsForm = jest.fn(() => ({ dialog: 'yay' }));
  });

  it('should call the method to generate dialogue elements for contactDetails', () => {
    DialogPrompts.contactDetails();
    expect(createTripDetailsForm.travelTripContactDetailsForm).toHaveBeenCalled();
  });

  it('should call the method to generate dialogue elements for flightDetails', () => {
    DialogPrompts.flightDetails();
    expect(createTripDetailsForm.travelTripFlightDetailsForm).toHaveBeenCalled();
  });

  it('should send travelTrip contact details dialogue', async () => {
    const payload = { id: 1, team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTravelTripDetailsForm(payload, 'contactDetails');

    expect(sendDialogTryCatch).toBeCalled();
  });

  it('should send travelTrip flight details dialogue', async () => {
    const payload = { id: 90, team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTravelTripDetailsForm(payload, 'flightDetails');

    expect(sendDialogTryCatch).toBeCalled();
  });
});
