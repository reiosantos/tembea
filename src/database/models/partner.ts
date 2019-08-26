import { Base } from '../base';
import { Column, BelongsToMany, Table } from 'sequelize-typescript';
import User from './user';
import Engagement from './engagement';

@Table
export default class Partner extends Base<Partner> {
  @Column
  name: string;

  @BelongsToMany(() => User, () => Engagement)
  engineers: User[];
}
