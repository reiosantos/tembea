import scheduler from 'node-schedule';
import MonthlyReportsJob from '../MonthlyReportsJob';

describe('MonthlyReprtsJob', () => {
  it('should scheduleAllMonthlyReports successfully', async () => {
    jest.spyOn(scheduler, 'scheduleJob').mockImplementation(async (start, fn) => {
      await fn();
    });
    
    await MonthlyReportsJob.scheduleAllMonthlyReports();
    expect(scheduler.scheduleJob).toBeCalledTimes(1);
  });
});
