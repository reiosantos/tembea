import { Base, enumToStringArray } from '../base';
import { Column, DataType, HasMany, ForeignKey, BelongsTo, Table } from 'sequelize-typescript';
import User from './user';
import Route from './route';
import Driver from './driver';
import Cab from './cab';
import Homebase from './homebase';
import Provider from './provider';

export enum RouteBatchStatuses {
  active = 'Active',
  inActive = 'Inactive',
}

@Table({
  paranoid: true,
  timestamps: true,
})
export default class RouteBatch extends Base<RouteBatch> {
  @Column
  inUse: number;

  @Column
  takeOff: string;

  @Column
  batch: string;

  @Column
  capacity: string;

  @Column({
    type: DataType.TEXT,
  })
  comments: string;

  @Column({
    type: DataType.ENUM(...enumToStringArray(RouteBatchStatuses)),
    defaultValue: RouteBatchStatuses.inActive,
  })
  status: RouteBatchStatuses;

  @Column
  @ForeignKey(() => Route)
  routeId: number;

  @Column
  @ForeignKey(() => Cab)
  cabId: number;

  @Column
  @ForeignKey(() => Driver)
  driverId: number;

  @Column
  @ForeignKey(() => Homebase)
  homebaseId: number;

  @Column
  @ForeignKey(() => Provider)
  providerId: number;

  @HasMany(() => User)
  riders: User[];

  @BelongsTo(() => Route)
  route: Route;

  @BelongsTo(() => Cab, 'cabId')
  cabDetails: Cab;

  @BelongsTo(() => Driver)
  driver: Driver;

  @BelongsTo(() => Homebase)
  homebase: Homebase;

  @ForeignKey(() => Provider)
  provider: Provider;
}
