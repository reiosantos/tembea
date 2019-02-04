import EmailService from '../../../services/EmailService';
import SlackHelpers from '../../slack/slackHelpers';
import MonthlyReportSender from '../monthlyReportSender';
import TeamDetailsService from '../../../services/TeamDetailsService';
import ReportGeneratorService from '../../../services/report/ReportGeneratorService';
import Utils from '../../../utils/index';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn()
  }))
}));

jest.mock('request-promise-native');
jest.mock('node-schedule');
jest.mock('../../../services/EmailService');

const summary = {
  percentageChange: '20.50',
  month: 'January',
  totalTrips: 100,
  totalTripsDeclined: 20,
  totalTripsCompleted: 80,
  departments: {
    tdd: {
      completed: 30,
      declined: 10,
      total: 40
    },
    success: {
      completed: 50,
      declined: 10,
      total: 60
    }
  }
};

const departmentsMock = [
  { label: 'operations', head: { email: '2324@email.com', name: 'san' } },
  { label: 'finance', head: { email: '2324@email.com', name: 'san' } },
  { label: 'tdd', head: { email: '2324@email.com', name: 'san' } }];

describe('MonthlyReportSender', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  describe('MonthlyReportSender_send', () => {
    it('should send an email to the concerned personnel', async (done) => {
      // arrange dependencies
      jest.spyOn(TeamDetailsService, 'getAllTeams').mockResolvedValue([
        {
          teamId: 'S123',
        },
        {
          teamId: 'S192'
        }
      ]);
      jest.spyOn(MonthlyReportSender, 'sendMail').mockResolvedValue(true);

      await MonthlyReportSender.send();

      expect(TeamDetailsService.getAllTeams).toHaveBeenCalledTimes(1);
      expect(MonthlyReportSender.sendMail).toHaveBeenCalledTimes(2);

      done();
    });

    it('should log error when getAllTeams fails', async (done) => {
      const error = 'yes, it failed';
      jest.spyOn(TeamDetailsService, 'getAllTeams').mockRejectedValue(new Error(error));

      try {
        MonthlyReportSender.send();
      } catch (err) {
        expect(err.message).toEqual(error);
      }
      done();
    });
  });

  describe('MonthlyReportSender_sendMail', () => {
    it('should generate email template and send mail', async (done) => {
      jest.spyOn(MonthlyReportSender, 'getAddresses')
        .mockResolvedValue(
          [
            {
              name: 'Victor Onwuzor',
              email: 'victor.onwuzor@andela.com'
            }
          ]
        );
      jest.spyOn(ReportGeneratorService, 'getOverallTripsSummary').mockResolvedValue(summary);
      jest.spyOn(MonthlyReportSender, 'getTemplate').mockResolvedValue();
      jest.spyOn(MonthlyReportSender, 'getEmailReportAttachment').mockResolvedValue();
      jest.spyOn(Utils, 'writableToReadableStream').mockReturnValue({});
      jest.spyOn(EmailService.prototype, 'sendMail').mockReturnValue(true);

      await MonthlyReportSender.sendMail({ team: { teamId: 'TEAMID2' } });

      expect(MonthlyReportSender.getAddresses).toHaveBeenCalled();
      expect(ReportGeneratorService.getOverallTripsSummary).toHaveBeenCalledTimes(1);
      expect(MonthlyReportSender.getTemplate).toHaveBeenCalledTimes(1);
      expect(MonthlyReportSender.getEmailReportAttachment).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getEmailReportAttachment', () => {
    it('should return a WriteStream object', async (done) => {
      const testReport = 'hello';
      const testAttach = { name: 'Sample Report' };
      jest.spyOn(ReportGeneratorService.prototype, 'generateMonthlyReport').mockResolvedValue(testReport);
      jest.spyOn(ReportGeneratorService.prototype, 'getEmailAttachmentFile').mockReturnValue(testAttach);
      jest.spyOn(ReportGeneratorService, 'writeAttachmentToStream').mockResolvedValue(true);

      // test
      const result = await MonthlyReportSender.getEmailReportAttachment();

      // assert
      expect(ReportGeneratorService.prototype.generateMonthlyReport).toHaveBeenCalled();
      expect(ReportGeneratorService.prototype.getEmailAttachmentFile).toHaveBeenCalledWith(testReport);
      expect(ReportGeneratorService.writeAttachmentToStream).toHaveBeenCalledWith(testAttach);
      expect(result).toBeTruthy();
      done();
    });
  });

  describe('getAddresses', () => {
    beforeEach(() => {
      jest.spyOn(SlackHelpers, 'getDepartments').mockResolvedValue(departmentsMock);
    });

    it('should return object of name and email', async (done) => {
      const result = await MonthlyReportSender.getAddresses();

      expect(result.length).toEqual(2);
      expect(result[0]).toHaveProperty('name');
      expect(result[1]).toHaveProperty('email');
      done();
    });
  });
  describe('getTemplate', () => {
    it('should ', async () => {
      const mockTemplate = '<div>This is a template</div>';
      const mockHbs = {
        baseTemplates: 'baseTemplate',
        render: jest.fn()
          .mockResolvedValue(mockTemplate),
      };
      MonthlyReportSender.scheduleReporting(mockHbs);
      const data = { test: 'dummy data' };
      const template = await MonthlyReportSender.getTemplate(data);
      expect(template)
        .toBe(mockTemplate);
      expect(mockHbs.render.mock.calls[0][0])
        .toBe(`${mockHbs.baseTemplates}/email/email.html`);
      expect(mockHbs.render.mock.calls[0][1])
        .toBe(data);
    });
  });
  describe('recurringFunction', () => {
    it('should ', async () => {
      jest.spyOn(MonthlyReportSender, 'send').mockResolvedValue();
      await MonthlyReportSender.recurringFunction();
      expect(MonthlyReportSender.send).toHaveBeenCalledTimes(1);
    });
  });
});
