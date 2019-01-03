import schedule from 'node-schedule';
import EmailService from '../../services/EmailService';
import ReportGeneratorService from '../../services/report/ReportGeneratorService';
import SlackHelpers from '../slack/slackHelpers';
import MailTemplate from './mailTemplate';
import Utils from '../../utils';
import BugsnagHelper from '../bugsnagHelper';

class MonthlyReportSender {
  /**
   * Must return an array of two objects,
   * Each object contains an email and a name
   * The first object is the receiver,
   * The last object is the CC.
   * ie: [{email: '', name: ''}, {email: '', name: ''}]
   *
   * @returns {*[]}
   */
  static async getAddresses() {
    const departments = await SlackHelpers.getDepartments();

    let filtered = departments.filter(department => !!(department.label && (
      department.label.toLowerCase() === 'operations'
        || department.label.toLowerCase() === 'finance')));

    filtered = filtered.map(department => ({
      name: department.head.name,
      email: department.head.email,
    }));

    return filtered;
  }

  /**
   * You never need to call this directly
   * @returns {Promise<*>}
   */
  static async getEmailReportAttachment() {
    const report = new ReportGeneratorService(1);
    const tripData = await report.generateMonthlyReport();
    const excelWorkBook = report.getEmailAttachmentFile(tripData);
    return ReportGeneratorService.writeAttachmentToStream(excelWorkBook);
  }

  static async send(callbackFunction) {
    try {
      const emailService = new EmailService();

      const receivers = await MonthlyReportSender.getAddresses();
      const summary = await ReportGeneratorService.getOverallTripsSummary();

      const subject = 'Monthly Report for trips taken by Andelans';
      const html = MailTemplate.tripReportMail(summary, receivers[0].name, receivers[1].name);
      const fileAttachment = await MonthlyReportSender.getEmailReportAttachment();

      const attachments = [
        {
          filename: `${summary.month} Report.xlsx`.replace(/[, ]/g, '_'),
          content: Utils.writableToReadableStream(fileAttachment),
        },
      ];

      const mailOptions = emailService.createEmailOptions(
        receivers[0].email, [receivers[1].email], subject, html, attachments
      );
      return emailService.sendMail(mailOptions, callbackFunction);
    } catch (e) {
      BugsnagHelper.log(e);
    }
  }

  static recurringFunction() {
    MonthlyReportSender.send().then();
  }

  /**
   * Scheduling a recurring execution of a method
   */
  static scheduleReporting() {
    schedule.scheduleJob('0 0 1 2 * *', MonthlyReportSender.recurringFunction);
  }
}

export default MonthlyReportSender;
