import { isTripRescheduleTimedOut } from '../slackValidations';

describe('isTripRescheduleTimedOut', () => {
  it('should return true', () => {
    const now = Date.now();
    const oneHourBefore = new Date(now - 60 * 60 * 1000);

    expect(isTripRescheduleTimedOut({
      departureTime: `${oneHourBefore.toISOString()}`
    })).toEqual(true);
  });

  it('should return true', () => {
    const now = Date.now();
    const oneHourAfter = new Date(now + 1 + 60 * 60 * 1000);

    expect(isTripRescheduleTimedOut({
      departureTime: `${oneHourAfter.toISOString()}`
    })).toEqual(false);
  });
});
