import schedule from 'node-schedule';
import EmailService from '../../services/EmailService';
import ReportGeneratorService from '../../services/report/ReportGeneratorService';
import SlackHelpers from '../slack/slackHelpers';
import Utils from '../../utils';
import BugsnagHelper from '../bugsnagHelper';
import TeamDetailsService from '../../services/TeamDetailsService';

class MonthlyReportSender {
  constructor(hbs) {
    this.hbsHelper = hbs;
    this.emailService = new EmailService();
  }

  async send() {
    try {
      const allTeams = await TeamDetailsService.getAllTeams();
      const promises = allTeams.map(team => this.sendMail(team.teamId));
      await Promise.all(promises);
      return;
    } catch (e) {
      BugsnagHelper.log(e);
    }
  }

  async getTemplate(data) {
    const template = await this.hbsHelper.render(
      `${this.hbsHelper.baseTemplates}/email/email.html`, data
    );
    return template;
  }

  async sendMail(teamId) {
    const receivers = await MonthlyReportSender.getAddresses(teamId);

    if (receivers && receivers.length > 0) {
      const summary = await ReportGeneratorService.getOverallTripsSummary();
      const subject = 'Monthly Report for trips taken by Andelans';
      const mainReceiver = receivers[1] || receivers[0];

      const html = await this.getTemplate({
        name: mainReceiver.name,
        month: summary.month,
        increased: Number.parseFloat(summary.percentageChange) > 0,
        departments: MonthlyReportSender.departmentToArray(summary.departments),
        summary
      });

      const fileAttachment = await MonthlyReportSender.getEmailReportAttachment();

      const attachments = [{
        filename: `${summary.month} Report.xlsx`.replace(/[, ]/g, '_'),
        content: Utils.writableToReadableStream(fileAttachment),
      }];
      const copyReceiverEmail = receivers[1] ? receivers[1].email : '';
      const mailOptions = this.emailService.createEmailOptions(
        mainReceiver.email, [copyReceiverEmail], subject, html, attachments
      );
      this.emailService.sendMail(mailOptions);
    }
  }

  /**
  * Must return an array of two objects,
  * Each object contains an email and a name
  * The first object is the receiver,
  * The last object is the CC.
  * ie: [{email: '', name: ''}, {email: '', name: ''}]
  *
  * @returns {*[]}
  */
  static async getAddresses(teamId) {
    const departments = await SlackHelpers.getDepartments(teamId);

    let filtered = departments.filter(department => !!(department.label && (
      department.label.toLowerCase() === 'operations'
                      || department.label.toLowerCase() === 'finance')));

    filtered.sort((a, b) => {
      if (a.label.toLowerCase() > b.label.toLowerCase()) return 1;
      return -1;
    });

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
    const attachment = await ReportGeneratorService.writeAttachmentToStream(excelWorkBook);
    return attachment;
  }

  static departmentToArray(departments) {
    const dept = Object.keys(departments);

    return dept.map(value => ({
      name: value,
      ...departments[value]
    }));
  }

  /**
  * Scheduling a recurring execution of a method
  */
  static scheduleReporting(hbs) {
    const scheduleHandler = new MonthlyReportSender(hbs);
    schedule.scheduleJob('0 0 1 2 * *', scheduleHandler.send);
  }
}

export default MonthlyReportSender;
