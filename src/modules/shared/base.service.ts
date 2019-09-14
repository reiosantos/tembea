import { IModelService } from './model.service.interface';
import database from '../../database';
import { Repository } from 'sequelize-typescript';
import { Identifier, Includeable, WhereOptions } from 'sequelize/types';
import { Base } from '../../database/base';

export class BaseService<T extends Base<T>, TId extends Identifier>
  implements IModelService<T, TId> {
  protected readonly model: Repository<T>;

  constructor(model: (new () => T)) {
    this.model = database.getRepository(model);
  }

  findOneByProp = async (option: IPropOption<T>) => {
    const result = await this.model.findOne({ where: this.createWhereOptions(option) });
    return result.get() as T;
  }

  findManyByProp = async (option: IPropOption<T>) => {
    const result = await this.model.findAll({ where: this.createWhereOptions(option) });
    return result.map((item) => item.get()) as T[];
  }

  findById = async (id: TId): Promise<T> => {
    const result = await this.model.findByPk(id);
    return result.get() as T;
  }

  findAll = async (options: IIncludeOptions): Promise<T[]> => {
    const result = await this.model.findAll({
      where: options.where,
      include: options.include,
    });
    return result.map((e) => e.get()) as T[];
  }

  async add<TInterface extends Object>(model: TInterface) {
    const result = await this.model.create(model);
    return result.get() as T;
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
