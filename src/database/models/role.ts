import { Table, Model, Column, BelongsToMany } from 'sequelize-typescript';
import User from './user';
import { Base } from '../base';
import UserRole from './user-role';

@Table
export default class Role extends Base<Role> {
  @Column({
    allowNull: false,
  })
  name: string;

  @BelongsToMany(() => User, () => UserRole)
  users: User[];
}
