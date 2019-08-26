import { Table, Column, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Base } from '../base';
import User from './user';
import Cab from './cab';
import Driver from './driver';

@Table({
  paranoid: true,
  timestamps: true,
})
export default class Provider extends Base<Provider> {
  @Column
  name: string;

  @Column
  isDirectMessage: boolean;

  @Column
  channelId: string;

  @Column
  @ForeignKey(() => User)
  providerUserId: number;

  @BelongsTo(() => User, 'providerUserId')
  user: User;

  @HasMany(() => Cab)
  vehicles: Cab[];

  @HasMany(() => Driver)
  drivers: Driver[];
}
