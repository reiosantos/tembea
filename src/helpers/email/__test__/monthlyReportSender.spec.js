import fs from 'fs';
import os from 'os';
import DepartmentService from '../../../services/DepartmentService';
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


  describe('send', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should send mail to expected recipients', async () => {
      jest.spyOn(testReporter, 'sendMail').mockResolvedValue(true);
      await testReporter.send();

      expect(TeamDetailsService.getAllTeams).toHaveBeenCalledTimes(1);
      expect(testReporter.sendMail).toHaveBeenCalledTimes(2);
    });

    it('should log to bugsnag if something goes wrong', async () => {
      const mockError = new Error('failed to send mail');
      jest.spyOn(testReporter, 'sendMail').mockRejectedValue(mockError);
      jest.spyOn(BugsnagHelper, 'log').mockReturnValue();

      await testReporter.send();

      expect(BugsnagHelper.log).toHaveBeenCalledWith(mockError);
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

    it('should send mail to expected people', async () => {
      jest.spyOn(testReporter.emailService, 'sendMail').mockImplementation();

      jest.spyOn(ReportGeneratorService, 'getOverallTripsSummary')
        .mockImplementation(() => ({ month: '', departments: '', percentageChange: 20 }));
      jest.spyOn(MonthlyReportSender, 'getEmailReportAttachment').mockImplementation(() => (new Promise(resolve => resolve(''))));
      jest.spyOn(MonthlyReportSender, 'processAttachments').mockImplementation(() => (new Promise(resolve => resolve([{}]))));
      jest.spyOn(Utils, 'writableToReadableStream').mockImplementation(() => [{}]);
      
      
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => ['']);

      await testReporter.sendMail();

      expect(ReportGeneratorService.getOverallTripsSummary).toHaveBeenCalled();
      expect(MonthlyReportSender.processAttachments).toHaveBeenCalled();
      expect(MonthlyReportSender.processAttachments).toHaveBeenCalled();
      expect(MonthlyReportSender.getEmailReportAttachment).toHaveBeenCalled();
    });
  });

  describe('getAddresses', () => {
    beforeEach(() => {
      jest.spyOn(DepartmentService, 'getDepartmentsForSlack').mockResolvedValue(departmentsMock);
    });

    it('should return object of name and email', async () => {
      const result = await MonthlyReportSender.getAddresses();

      expect(result.length).toEqual(2);
      expect(result[0]).toHaveProperty('name');
      expect(result[1]).toHaveProperty('email');
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

  describe('processAttachments', () => {
    it('should processAttachments', async () => {
      jest.spyOn(fs, 'createWriteStream').mockImplementation();
      jest.spyOn(os, 'tmpdir').mockImplementation(() => '');
      jest.spyOn(Utils, 'writableToReadableStream')
        .mockImplementation(() => ({
          pipe: jest.fn(),
          close: jest.fn(),
          on: ((end, fn) => {
            fn();
          })
        }));
      const attachments = [{ filename: '', content: jest.fn() }];
      MonthlyReportSender.processAttachments(attachments);
      expect(Utils.writableToReadableStream).toBeCalled();
    });
  });
});
