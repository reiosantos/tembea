import createTripDetailsForm from '../index';
import {
  SlackDialogSelectElementWithOptions,
  SlackDialogText
} from '../../../../modules/slack/SlackModels/SlackDialogModels';

describe('createTeamDetails create team details attachment', () => {
  describe('regularTripForm', () => {
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
  });
  describe('travelTripContactDetailsForm', () => {
    it('should return an array', () => {
      const tripDetails = createTripDetailsForm.travelTripContactDetailsForm();
      expect(tripDetails instanceof Array).toBeTruthy();
      expect(tripDetails.length).toEqual(4);
    });
  });
  describe('travelTripFlightDetailsForm', () => {
    it('should return an array ', () => {
      const tripDetails = createTripDetailsForm.travelTripFlightDetailsForm();
      expect(tripDetails instanceof Array).toBeTruthy();
      expect(tripDetails.length).toEqual(6);
    });
  });
  describe('travelEmbassyDetailsForm', () => {
    it('should return an array of length 5', () => {
      const tripDetails = createTripDetailsForm.travelEmbassyDetailsForm();
      expect(tripDetails instanceof Array)
        .toBeTruthy();
      expect(tripDetails.length)
        .toEqual(4);
    });
  });
});
