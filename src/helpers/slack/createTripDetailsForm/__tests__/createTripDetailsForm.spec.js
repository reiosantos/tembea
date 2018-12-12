import createTripDetailsForm from '../index';
import {
  SlackDialogElementWithDataSource,
  SlackDialogSelectElementWithOptions,
  SlackDialogText
} from '../../../../modules/slack/SlackModels/SlackDialogModels';

describe('create trip details attachment', () => {
  it('should return an array of length 5', () => {
    const tripDetails = createTripDetailsForm.regularTripForm();
    expect(tripDetails instanceof Array).toBeTruthy();
    expect(tripDetails.length).toEqual(5);
  });

  it('should contain an entry with type SlackDialogSelectElementWithOptions', () => {
    const tripDetails = createTripDetailsForm.regularTripForm();
    expect(tripDetails[0] instanceof SlackDialogSelectElementWithOptions).toBeTruthy();
    expect(tripDetails.length).toEqual(5);
  });

  it('should contain an entry with type SlackDialogText', () => {
    const tripDetails = createTripDetailsForm.regularTripForm();
    expect(tripDetails[1] instanceof SlackDialogText).toBeTruthy();
    expect(tripDetails.length).toEqual(5);
  });

  it('should return an array with contactDetailsFields with an array length of 4', () => {
    const result = createTripDetailsForm.travelTripContactDetailsForm();
    expect(result[0] instanceof SlackDialogElementWithDataSource).toBeTruthy();
    expect(result[1] instanceof SlackDialogText).toBeTruthy();
    expect(result.length).toEqual(4);
  });

  it('should return an array with flightDetailsFields with an array length of 4', () => {
    const result = createTripDetailsForm.travelTripFlightDetailsForm();
    expect(result[0] instanceof SlackDialogText).toBeTruthy();
    expect(result[1] instanceof SlackDialogText).toBeTruthy();
    expect(result[2] instanceof SlackDialogText).toBeTruthy();
    expect(result[3] instanceof SlackDialogText).toBeTruthy();
    expect(result.length).toEqual(4);
  });
});
