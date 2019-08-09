import debug from 'debug';
import http from 'http';
import env from './config/environment';
import app from './app';
import BootJobsService from './services/jobScheduler/BootJobs';
import StartUpHelper from './scripts/startUpHelper';

const logger = debug('log');
const server = http.createServer(app);

// create super admin method
StartUpHelper.ensureSuperAdminExists();
StartUpHelper.addDefaultAddresses();

server.listen(env.PORT, async () => {
  app.set('host', `http://localhost:${env.PORT}`);

  logger(`Find me on http://localhost:${env.PORT}`);
  await BootJobsService.scheduleJobs();
  StartUpHelper.registerEventHandlers();
});
