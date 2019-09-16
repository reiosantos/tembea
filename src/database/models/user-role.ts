import { Table, Model, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './user';
import Role from './role';
import Homebase from './homebase';

@Table
export default class UserRole extends Model<UserRole> {
  @Column
  @ForeignKey(() => User)
  userId: number;

  @Column
  @ForeignKey(() => Role)
  roleId: number;

  @Column
  @ForeignKey(() => Homebase)
  homebaseId: number;

  @BelongsTo(() => Role)
  role: Role;

  @BelongsTo(() => Homebase)
  homebase: Homebase;
}
