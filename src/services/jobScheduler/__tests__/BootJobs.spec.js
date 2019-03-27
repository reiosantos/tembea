import BootJobsService, { bootJobs } from '../BootJobs';


describe('BootJobsService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('scheduleJobs', () => {
    it('should return trip status when it being  passed', async () => {
      jest.spyOn(BootJobsService, 'scheduleJobs');
      jest.spyOn(bootJobs, 'map').mockImplementation(async (job) => {
        await job();
      });
      await BootJobsService.scheduleJobs();
      expect(BootJobsService.scheduleJobs).toBeCalledTimes(1);
    });
  });
});
