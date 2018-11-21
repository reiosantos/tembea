import express from 'express';
// slack sdk have issues with body-parser, will be addressed later.
// import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import bugsnag from 'bugsnag';
import expressValidator from 'express-validator';
import modules from './modules';

const app = express();

if (!process.env.NODE_ENV.match('test')
  /* istanbul ignore next */
  && process.env.BUGSNAG_API_KEY
) {
  /* istanbul ignore next */
  bugsnag.register(process.env.BUGSNAG_API_KEY);
  /* istanbul ignore next */
  app.use(bugsnag.requestHandler);
  /* istanbul ignore next */
  app.use(bugsnag.errorHandler);
}

app.use(cors());
app.use(morgan('dev'));
app.use(expressValidator());

// set base url for api
modules(app);

// catch all routers
app.use('*', (req, res) => res.status(404).json({
  message: 'Not Found. Use /api/v1 to access the api'
}));

export default app;
