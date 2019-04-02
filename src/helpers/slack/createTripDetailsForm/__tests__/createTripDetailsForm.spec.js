import createTripDetailsForm from '../index';
import {
  SlackDialogSelectElementWithOptions,
  SlackDialogText
} from '../../../../modules/slack/SlackModels/SlackDialogModels';

describe('createTeamDetails create team details attachment', () => {
  describe('regularTripForm', () => {
    it('should return an array of length 3', () => {
      const tripDetails = createTripDetailsForm.regularTripForm();
      expect(tripDetails instanceof Array).toBeTruthy();
      expect(tripDetails.length).toEqual(3);
    });

    it('should contain an entry with type SlackDialogSelectElementWithOptions', () => {
      const tripDetails = createTripDetailsForm.regularTripForm();
      expect(tripDetails[1] instanceof SlackDialogSelectElementWithOptions).toBeTruthy();
      expect(tripDetails.length).toEqual(3);
    });

    it('should contain an entry with type SlackDialogText', () => {
      const tripDetails = createTripDetailsForm.regularTripForm();
      expect(tripDetails[0] instanceof SlackDialogText).toBeTruthy();
      expect(tripDetails.length).toEqual(3);
    });
  });
  describe('tripDestinationLocationForm', () => {
    it('should return an array of length 2', () => {
      const tripDetails = createTripDetailsForm.tripDestinationLocationForm();
      expect(tripDetails instanceof Array).toBeTruthy();
      expect(tripDetails.length).toEqual(2);
    });

    it('should contain an entry with type SlackDialogSelectElementWithOptions', () => {
      const tripDetails = createTripDetailsForm.tripDestinationLocationForm();
      expect(tripDetails[0] instanceof SlackDialogSelectElementWithOptions).toBeTruthy();
      expect(tripDetails.length).toEqual(2);
    });

    it('should contain an entry with type SlackDialogText', () => {
      const tripDetails = createTripDetailsForm.tripDestinationLocationForm();
      expect(tripDetails[1] instanceof SlackDialogText).toBeTruthy();
      expect(tripDetails.length).toEqual(2);
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
      expect(tripDetails.length).toEqual(4);
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
  describe('travelDestinationForm', () => {
    it('Should call SlackDialogSelectElementWithOptions and SlackDialogText', () => {
      const tripDetails = createTripDetailsForm.travelDestinationForm();
      expect(tripDetails[0] instanceof SlackDialogSelectElementWithOptions).toBeTruthy();
      expect(tripDetails[1] instanceof SlackDialogText).toBeTruthy();
    });
  });
  describe('travelTripNoteForm', () => {
    it('should return an array of length of 1', () => {
      const tripDetails = createTripDetailsForm.travelTripNoteForm('value');
      expect(tripDetails instanceof Array)
        .toBeTruthy();
      expect(tripDetails[0].value).toEqual('value');
      expect(tripDetails.length).toEqual(1);
    });
  });
});
