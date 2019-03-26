import debug from 'debug';
import dotenv from 'dotenv';
import http from 'http';
import env from './config/environment';
import app from './app';
import BootJobsService from './services/jobScheduler/BootJobs';

dotenv.config();
const logger = debug('log');
const server = http.createServer(app);

server.listen(env.PORT, () => {
  app.set('host', `http://localhost:${env.PORT}`);

  logger(`Find me on http://localhost:${env.PORT}`);
  BootJobsService.scheduleJobs();
});
