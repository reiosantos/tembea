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
