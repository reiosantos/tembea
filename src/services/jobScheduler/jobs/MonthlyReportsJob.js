import schedule from 'node-schedule';
import MonthlyReportSender from '../../../helpers/email/monthlyReportSender';
import { hbs } from '../../../app';

const time = process.env.MONTHLY_EMAIL_TIME || '1:1:1';
const [date, hour, minute] = time.split(':');
class MonthlyReportsJob {
  static async scheduleAllMonthlyReports() {
    const rule = new schedule.RecurrenceRule();
    rule.month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    rule.date = date;
    rule.hour = hour;
    rule.minute = minute;
    schedule.scheduleJob(rule, async () => {
      await new MonthlyReportSender(hbs).sendMail();
    });
  }
}

export default MonthlyReportsJob;
