import { IsTripRescheduleTimedOut } from '../slackValidations';

describe('IsTripRescheduleTimedOut', () => {
  it('should return true', () => {
    const now = Date.now();
    const oneHourBefore = new Date(now - 60 * 60 * 1000);

    expect(IsTripRescheduleTimedOut({
      departureTime: `${oneHourBefore.toISOString()}`
    })).toEqual(true);
  });

  it('should return true', () => {
    const now = Date.now();
    const oneHourAfter = new Date(now + 1 + 60 * 60 * 1000);

    expect(IsTripRescheduleTimedOut({
      departureTime: `${oneHourAfter.toISOString()}`
    })).toEqual(false);
  });
});
