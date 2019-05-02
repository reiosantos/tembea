import TripCompletionJob from './jobs/TripCompletionJob';
import ConfirmRouteUseJob from './jobs/ConfirmRouteUseJob';
import MonthlyReportsJob from './jobs/MonthlyReportsJob';


export const bootJobs = [
  TripCompletionJob.sendNotificationForConfirmedTrips,
  ConfirmRouteUseJob.autoStartRouteJob,
  MonthlyReportsJob.scheduleAllMonthlyReports
];

class BootJobsService {
  static async scheduleJobs() {
    bootJobs.map(async (job) => {
      await job();
    });
  }
}
export default BootJobsService;
