import fs from 'fs';
import path from 'path';
import { createNamespace } from 'cls-hooked';
import Sequelize from 'sequelize';
import config from '../../config/database';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const db = {};

const namespace = createNamespace('sequelize-transaction');
Sequelize.useCLS(namespace);
const sequelize = new Sequelize(config[env].databaseUrl, config[env]);

fs.readdirSync(__dirname)
  .filter(
    file => file.indexOf('.') !== 0
    && file !== basename
    && file.slice(-3) === '.js',
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// DO NOT CHANGE EVER!!!
module.exports = db;
