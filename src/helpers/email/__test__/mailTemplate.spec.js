import MailTemplate from '../mailTemplate';

const nameOne = 'Mubarak';
const nameTwo = 'Victor';
const summary = {
  month: 'January, 2018',
  toName: 'Mubarak',
  percentageChange: '23',
  totalTrips: 40,
  totalTripsDeclined: 0,
  totalTripsCompleted: 35,
  departments: {
    People: {
      completed: 43,
      declined: 43,
      total: 66
    },
    TDD: {
      completed: 10,
      declined: 3,
      total: 13
    },
    Marketing: {
      completed: 5,
      declined: 10,
      total: 15
    },
    Success: {
      completed: 12,
      declined: 8,
      total: 20
    },
    Travel: {
      completed: 10,
      declined: 4,
      total: 14
    }
  }
};

describe('MailTemplate Test', () => {
  it('should return a string containing values of parameter passed in', () => {
    const result = MailTemplate.tripReportMail(summary, nameOne, nameTwo);

    expect(result).toContain(nameOne);
    expect(result).toContain(nameTwo);
    expect(result).toContain(summary.month);
    expect(result).toContain(summary.percentageChange);
  });
});
