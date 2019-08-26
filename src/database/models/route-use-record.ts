import { Table, Column, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Base } from '../base';
import RouteBatch from './route-batch';

@Table
export default class RouteUseRecord extends Base<RouteUseRecord> {
  @Column({
    allowNull: true,
    defaultValue: 0,
  })
  confirmedUsers: number;

  @Column({
    allowNull: true,
    defaultValue: 0,
  })
  unConfirmedUsers: number;

  @Column({
    allowNull: true,
    defaultValue: 0,
  })
  skippedUsers: number;

  @Column({
    allowNull: true,
    defaultValue: 0,
  })
  pendingUsers: number;

  @Column({
    allowNull: false,
  })
  batchUseDate: string;

  @Column
  @ForeignKey(() => RouteBatch)
  batchId: number;

  @BelongsTo(() => RouteBatch)
  batch: RouteBatch;
}
