import fs from 'fs';
import os from 'os';
import { join } from 'path';
import EmailService from '../../services/EmailService';
import ReportGeneratorService from '../../services/report/ReportGeneratorService';
import DepartmentService from '../../services/DepartmentService';
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

  static async processAttachments(attachments) {
    const files = await Promise.all(attachments.map(async (element) => {
      const fileName = join(os.tmpdir(), element.filename);
      const writeStream = fs.createWriteStream(fileName);
      const readStream = Utils.writableToReadableStream(element.content);
      readStream.pipe(writeStream);
      const promise = await new Promise((resolve, reject) => {
        readStream.on('end', () => {
          readStream.close();
          resolve(fileName);
        });
        readStream.on('error', reject);
      });
      return promise;
    }));
    return files;
  }

  async generateSendMailAttachment() {
    const summary = await ReportGeneratorService.getOverallTripsSummary();
    const html = await this.getTemplate({
      name: 'Operations Team ',
      month: summary.month,
      increased: Number.parseFloat(summary.percentageChange) > 0,
      departments: MonthlyReportSender.departmentToArray(summary.departments),
      summary
    });
    const attachments = [{
      filename: `${summary.month} Report.xlsx`.replace(/[, ]/g, '_'),
      content: Utils.writableToReadableStream(await MonthlyReportSender.getEmailReportAttachment()),
    }];
    const files = await MonthlyReportSender.processAttachments(attachments);
    return { html, files };
  }
  
  async sendMail() {
    const { html, files } = await this.generateSendMailAttachment();
  
    if (process.env.TEMBEA_MAIL_ADDRESS && process.env.KENYA_TRAVEL_TEAM_EMAIL) {
      await this.emailService.sendMail({
        from: `TEMBEA <${process.env.TEMBEA_MAIL_ADDRESS}>`,
        to: process.env.KENYA_TRAVEL_TEAM_EMAIL,
        subject: 'Monthly Report for trips taken by Andelans',
        attachment: files,
        html
      });
    } else {
      BugsnagHelper.log('Either TEMBEA_MAIL_ADDRESS or '
        + 'KENYA_TRAVEL_TEAM_EMAIL has not been set in the .env ');
    }
    try {
      files.forEach((file) => { fs.unlinkSync(file); });
    } catch (err) { return err; }
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
    const departments = await DepartmentService.getDepartmentsForSlack(teamId);

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
}

export default MonthlyReportSender;
