import { Sequelize } from 'sequelize-typescript';
import environment from '../config/environment';
import config from '../config/database';

const modelsPath = `${__dirname}/models`;

const database = new Sequelize(environment.DATABASE_URL, {
  models: [modelsPath],
  ...config[environment.NODE_ENV],
});

export default database;
