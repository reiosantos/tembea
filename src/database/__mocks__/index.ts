import database from '../index';
import { Repository } from 'sequelize-typescript';
import { Base } from '../../database/base';

export function getMockRepository<T extends Base<T>>(x: (new () => T)): Repository<T> {
  let model: Repository<T>;
  switch (x.name) {
    case 'User':
      model = database.getRepository(x);
      break;
    default:
      return null;
  }
  return model;
}
