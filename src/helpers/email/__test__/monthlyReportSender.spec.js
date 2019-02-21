import schedule from 'node-schedule';
import SlackHelpers from '../../slack/slackHelpers';
import MonthlyReportSender from '../monthlyReportSender';
import TeamDetailsService from '../../../services/TeamDetailsService';
import ReportGeneratorService from '../../../services/report/ReportGeneratorService';
import Utils from '../../../utils/index';
import BugsnagHelper from '../../bugsnagHelper';

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

const hbsMock = {
  render: (_, data) => Promise.resolve(`<h1>Hello World ${data.name}</h1>`),
  baseTemplates: 'hello'
};

const teamsMock = [
  {
    teamId: 'S123',
  },
  {
    teamId: 'S192'
  }
];

describe('MonthlyReportSender', () => {
  const testReporter = new MonthlyReportSender(hbsMock);
  beforeEach(() => {
    jest.spyOn(TeamDetailsService, 'getAllTeams').mockResolvedValue(teamsMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('scheduleReporting', () => {
    it('should invoke the schedule.scheduleJob function', () => {
      jest.spyOn(schedule, 'scheduleJob').mockResolvedValue();

      MonthlyReportSender.scheduleReporting(hbsMock);
      expect(schedule.scheduleJob).toHaveBeenCalledTimes(1);
    });
  });

  describe('send', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should send mail to expected recipients', async (done) => {
      jest.spyOn(testReporter, 'sendMail').mockResolvedValue(true);
      await testReporter.send();

      expect(TeamDetailsService.getAllTeams).toHaveBeenCalledTimes(1);
      expect(testReporter.sendMail).toHaveBeenCalledTimes(2);
      done();
    });

    it('should log to bugsnag if something goes wrong', async (done) => {
      const mockError = new Error('failed to send mail');
      jest.spyOn(testReporter, 'sendMail').mockRejectedValue(mockError);
      jest.spyOn(BugsnagHelper, 'log').mockReturnValue();

      await testReporter.send();

      expect(BugsnagHelper.log).toHaveBeenCalledWith(mockError);
      done();
    });
  });

  describe('sendMail', () => {
    beforeEach(() => {
      jest.spyOn(MonthlyReportSender, 'getAddresses').mockResolvedValue(
        departmentsMock.map(department => ({
          name: department.head.name,
          email: department.head.email,
        }))
      );

      jest.spyOn(ReportGeneratorService, 'getOverallTripsSummary').mockResolvedValue(summary);

      jest.spyOn(MonthlyReportSender, 'getEmailReportAttachment').mockResolvedValue('hello');
      jest.spyOn(Utils, 'writableToReadableStream').mockResolvedValue('true');
    });

    it('should send mail to expected people', async (done) => {
      const testTeamId = 2;
      const mailSpy = jest.spyOn(testReporter.emailService, 'sendMail').mockResolvedValue();

      await testReporter.sendMail(testTeamId);

      expect(ReportGeneratorService.getOverallTripsSummary).toHaveBeenCalled();
      expect(mailSpy).toHaveBeenCalled();
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
      const testToken = 'testing';
      const template = await testReporter.getTemplate({ name: testToken });

      const include = template.includes(testToken);
      expect(include).toBeTruthy();
    });
  });
});
