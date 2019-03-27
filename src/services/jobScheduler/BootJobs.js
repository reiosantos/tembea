import TripCompletionJob from './jobs/TripCompletionJob';
import ConfirmRouteUseJob from './jobs/ConfirmRouteUseJob';


export const bootJobs = [
  TripCompletionJob.sendNotificationForConfirmedTrips,
  ConfirmRouteUseJob.autoStartRouteJob,
];

class BootJobsService {
  static async scheduleJobs() {
    bootJobs.map(async (job) => {
      await job();
    });
  }
}
export default BootJobsService;
