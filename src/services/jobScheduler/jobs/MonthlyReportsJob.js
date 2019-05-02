
import schedule from 'node-schedule';
import MonthlyReportSender from '../../../helpers/email/monthlyReportSender';
import { hbs } from '../../../app';

class MonthlyReportsJob {
  static async scheduleAllMonthlyReports() {
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [1];
    rule.date = [1, 2, 3, 4, 5, 6, 7];
    rule.hour = 1;
    schedule.scheduleJob(rule, async () => {
      await new MonthlyReportSender(hbs).sendMail();
    });
  }
}

export default MonthlyReportsJob;
