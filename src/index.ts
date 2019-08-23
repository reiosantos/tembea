import debug from 'debug';
import http from 'http';
import environment from './config/environment';
import app from './app';
import BootJobs from './services/jobScheduler/BootJobs';
import startUpHelper from './scripts/startUpHelper';

const logger = debug('log');
const server = http.createServer(app);

// create super admin method
startUpHelper.ensureSuperAdminExists();

server.listen(environment.PORT, async () => {
  app.set('host', `http://localhost:${environment.PORT}`);

  logger(`Find me on http://localhost:${environment.PORT}`);
  await BootJobs.scheduleJobs();
});
