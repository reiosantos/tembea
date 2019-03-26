import TripCompletionJob from './jobs/TripCompletionJob';


const bootJobs = [TripCompletionJob.sendNotificationForConfirmedTrips];

class BootJobsService {
  static async scheduleJobs() {
    bootJobs.map(async (job) => {
      await job();
    });
  }
}
export default BootJobsService;
