import TripCabController from '../TripCabController';
import SlackInteractions from '../../SlackInteractions';


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
        cab: 'DriverName 8484938389 HFKF-84748'
      }
    };
    const sendCreateCabSpy = jest.spyOn(SlackInteractions, 'handleTripActions');
    TripCabController.handleSelectCabDialogSubmission(data, respond);
    expect(sendCreateCabSpy).toHaveBeenCalledTimes(1);
    done();
  });
});
