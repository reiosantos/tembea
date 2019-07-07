import TripCabController from '../TripCabController';
import SlackInteractions from '../../SlackInteractions';
import TripActionsController from '../TripActionsController';


describe('TripCabController', () => {
  let respond;
  beforeEach(() => {
    respond = jest.fn();
  });
  it('should send create cab Attacment', (done) => {
    const payload = {
      state: JSON.stringify({}),
      submission: {
        confirmationComment: 'comment'
      }
    };
    const result = TripCabController.sendCreateCabAttachment(payload, 'operations_approval_trip', null);
    expect(result.text).toEqual('*Proceed to Create New Cab*');
    done();
  });
  it('should handle non create new cab submission', async () => {
    const data = {
      submission: {
        driver: '1, DriverName, 8484938389, HFKF-84748'
      },
      team: { id: 'ABC' },
      user: { id: 'XYZ' },
    };
    jest.spyOn(TripActionsController, 'completeTripRequest').mockResolvedValue();
    await TripCabController.handleSelectCabDialogSubmission(data, respond);
    expect(TripActionsController.completeTripRequest).toHaveBeenCalledTimes(1);
  });
  it('should handle provider assignment submission', (done) => {
    const data = {
      submission: {
        provider: 'DbrandTaxify, 1, UXTXFY'
      }
    };
    const handleTripActionsSpy = jest.spyOn(SlackInteractions, 'handleTripActions');
    TripCabController.handleSelectProviderDialogSubmission(data, respond);
    expect(handleTripActionsSpy).toHaveBeenCalled();
    done();
  });
});
