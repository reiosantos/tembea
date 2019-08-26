import { Column, DataType, HasMany, ForeignKey, BelongsTo, Table } from 'sequelize-typescript';
import { Base } from '../base';
import Address from './address';
import RouteBatch from './route-batch';
import Homebase from './homebase';

@Table
export default class Route extends Base<Route> {
  @Column
  name: string;

  @Column({
    type: DataType.TEXT,
  })
  imageUrl: string;

  @Column
  @ForeignKey(() => Address)
  destinationId: number;

  @Column
  @ForeignKey(() => Homebase)
  homebaseId: number;

  @HasMany(() => RouteBatch)
  batches: RouteBatch[];

  @BelongsTo(() => Address)
  destination: Address;

  @BelongsTo(() => Homebase)
  homebase: Homebase;
}
