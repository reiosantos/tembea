import { IModelService } from './model.service.interface';
import database from '../../database';
import { Repository } from 'sequelize-typescript';
import { Identifier, Includeable, WhereOptions } from 'sequelize/types';
import { Base } from '../../database/base';
import RemoveDataValues from '../../helpers/removeDataValues';

export class BaseService<T extends Base<T>, TId extends Identifier>
  implements IModelService<T, TId> {
  protected readonly model: Repository<T>;

  constructor(model: (new () => T)) {
    this.model = database.getRepository(model);
  }

  findOneByProp = async (option: IPropOption<T>) => {
    const result = await this.model.findOne({ where: this.createWhereOptions(option) });
    return this.serialize(result);
  }

  findManyByProp = async (option: IPropOption<T>) => {
    const result = await this.model.findAll({ where: this.createWhereOptions(option) });
    return this.serialize(result);
  }

  findById = async (id: TId): Promise<T> => this.model.findByPk(id);

  findAll = async (options: IIncludeOptions): Promise<T[]> => {
    const result = await this.model.findAll({
      where: options.where,
      include: options.include,
    });
    return result;
  }

  async add<TInterface extends Object>(model: TInterface) {
    const result = await this.model.create(model);
    return this.serialize(result);
  }

  serialize<U>(data: U): U {
    return RemoveDataValues.removeDataValues(data);
  }

  createWhereOptions = (option: IPropOption<T>) => ({ [option.prop]: option.value });
}

export interface IIncludeOptions {
  where: WhereOptions;
  include: Includeable[];
}

export interface IPropOption<T> {
  prop: keyof T;
  value: any;
}
