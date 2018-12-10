import MonthlyReportSender from '../monthlyReportSender';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn()
  }))
}));

describe('Monthly report Sender Class', () => {
  it('should send an email to the concerned personnel', async (done) => {
    const sender = await MonthlyReportSender.send();
    expect(sender).toBeUndefined();
    expect(MonthlyReportSender.recurringFunction()).toEqual(undefined);

    done();
  });
});
