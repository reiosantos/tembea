import express from 'express';
import path from 'path';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import bugsnag from 'bugsnag';
import expressValidator from 'express-validator';
import modules from './modules';
import SlackBodyParserFilter from './helpers/slackBodyParserFilter';
import './modules/slack/events/index';

dotenv.config();

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

app.use(SlackBodyParserFilter.maybe(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
));
app.use(SlackBodyParserFilter.maybe(bodyParser.json()));

app.use(expressValidator());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', exphbs.create({
  defaultLayout: '_layout.html',
  layoutsDir: `${app.get('views')}/layouts`,
  partialsDir: [`${app.get('views')}/partials`]
}).engine);
app.set('view engine', 'html');

// set base url for api
modules(app);

// catch all routers
app.use('*', (req, res) => res.status(404).json({
  message: 'Not Found. Use /api/v1 to access the api'
}));

export default app;
