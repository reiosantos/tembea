import EmailService from '../../../services/EmailService';
import SlackHelpers from '../../slack/slackHelpers';
import MonthlyReportSender from '../monthlyReportSender';
import env from '../../../config/environment';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn()
  }))
}));

jest.mock('request-promise-native');
jest.mock('../../../services/EmailService');

describe('MonthlyReportSender: Monthly report Sender Class', () => {
  beforeEach(() => {
    MonthlyReportSender.app = {
      get: jest.fn(() => ({
        host: `http://localhost:${env.PORT}`
      }).host)
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    EmailService.mockClear();
  });

  it('should send an email to the concerned personnel', async (done) => {
    MonthlyReportSender.departmentToArray = jest.fn();
    const spy = jest.spyOn(MonthlyReportSender, 'getAddresses');

    const sender = await MonthlyReportSender.send();

    expect(MonthlyReportSender.departmentToArray).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(sender).toBeUndefined();
    expect(MonthlyReportSender.recurringFunction()).toEqual(undefined);

    done();
  });

  it('send() an email with departments sorted', async (done) => {
    MonthlyReportSender.departmentToArray = jest.fn();

    MonthlyReportSender.getAddresses = jest.fn(() => ([
      { email: '2324@email.com', name: 'san' },
      { email: '2324@email.com', name: 'san' },
      { email: '2324@email.com', name: 'san' }]));

    const sender = await MonthlyReportSender.send();

    expect(MonthlyReportSender.getAddresses).toHaveBeenCalledTimes(1);
    expect(sender).toBeUndefined();

    done();
  });

  it('Send(): should raise exception', async (done) => {
    SlackHelpers.getDepartments = jest.fn(() => ([
      { label: 'operations', head: { email: '2324@email.com', name: 'san' } },
      { label: 'finance' },
      { label: 'operations', head: { email: '2324@email.com', name: 'san' } }]));

    const sender = async () => {
      await MonthlyReportSender.send();
    };
    expect(sender()).rejects.toThrow();

    done();
  });
});
