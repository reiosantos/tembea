import { Table, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Base } from '../base';
import Provider from './provider';
import { IDriver } from './interfaces/driver.interface';
import User from './user';

@Table({
  paranoid: true,
  timestamps: true,
})
export default class Driver extends Base<Driver> implements IDriver {
  @Column
  driverName: string;

  @Column
  driverPhoneNo: string;

  @Column
  driverNumber: string;

  @Column
  @ForeignKey(() => Provider)
  providerId: number;

  @Column
  @ForeignKey(() => User)
  userId?: number;

  @BelongsTo(() => Provider)
  provider: Provider;

  @BelongsTo(() => User)
  user: User;
}
