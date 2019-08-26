import { Table, Column, ForeignKey, BelongsTo, DataType,
  Scopes, DefaultScope } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Base, enumToStringArray } from '../base';
import User from './user';
import Homebase from './homebase';
import { IDepartment } from './interfaces/department.interface';
import TeamDetails from './team-details';

export enum DepartmentStatuses {
  active = 'Active',
  inactive = 'Inactive',
}

@DefaultScope(() => ({
  where: {
    status: DepartmentStatuses.active,
  },
}))
@Scopes(() => ({
  all: {
    where: {
      status: { [Op.or]: [DepartmentStatuses.active, DepartmentStatuses.inactive] },
    },
  },
  inactive: {
    where: {
      status: DepartmentStatuses.inactive,
    },
  },
}))
@Table
export default class Department extends Base<Department> implements IDepartment {
  @Column({
    unique: true,
  })
  name: string;

  @Column({
    allowNull: false,
  })
  @ForeignKey(() => TeamDetails)
  teamId: string;

  @Column({
    type: DataType.ENUM(...enumToStringArray(DepartmentStatuses)),
    defaultValue: DepartmentStatuses.active,
  })
  status: DepartmentStatuses;

  @ForeignKey(() => User)
  headId: number;

  @ForeignKey(() => Homebase)
  homebaseId: number;

  @BelongsTo(() => User)
  head: User;

  @BelongsTo(() => Homebase)
  homebase: Homebase;
}
