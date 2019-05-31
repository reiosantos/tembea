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
  it('should handle create new cab submission', (done) => {
    const data = {
      submission: {
        cab: 'Create New Cab'
      }
    };
    const sendCreateCabSpy = jest.spyOn(TripCabController, 'sendCreateCabAttachment');
    TripCabController.handleSelectCabDialogSubmission(data, respond);
    expect(sendCreateCabSpy).toHaveBeenCalledTimes(1);
    done();
  });
  it('should handle non create new cab submission', (done) => {
    const data = {
      submission: {
        driver: 'DriverName, 8484938389, HFKF-84748'
      }
    };
    const completeTripSpy = jest.spyOn(TripActionsController, 'completeTripRequest');
    TripCabController.handleSelectCabDialogSubmission(data, respond);
    expect(completeTripSpy).toHaveBeenCalledTimes(1);
    done();
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
