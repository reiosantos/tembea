import createTripDetails from '../index';
import {
  SlackDialogSelectElementWithOptions,
  SlackDialogText
} from '../../../../modules/slack/SlackModels/SlackDialogModels';

describe('createTeamDetails create team details attachment', () => {
  it('should return an array of length 5', () => {
    const tripDetails = createTripDetails();
    expect(tripDetails instanceof Array).toBeTruthy();
    expect(tripDetails.length).toEqual(5);
  });

  it('should contain an entry with type SlackDialogSelectElementWithOptions', () => {
    const tripDetails = createTripDetails();
    expect(tripDetails[0] instanceof SlackDialogSelectElementWithOptions).toBeTruthy();
    expect(tripDetails.length).toEqual(5);
  });

  it('should contain an entry with type SlackDialogText', () => {
    const tripDetails = createTripDetails();
    expect(tripDetails[1] instanceof SlackDialogText).toBeTruthy();
    expect(tripDetails.length).toEqual(5);
  });
});
