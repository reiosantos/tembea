import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Base, enumToStringArray } from '../base';
import User from './user';
import RouteUseRecord from './route-use-record';
import RouteBatch from './route-batch';

export enum BatchUseRecordStatuses {
  notConfirmed = 'NotConfirmed',
  confirmed = 'Confirmed',
  skip = 'Skip',
  pending = 'Pending',
}

@Table
export default class BatchUseRecord extends Base<BatchUseRecord> {
  @Column({
    type: DataType.ENUM(...enumToStringArray(BatchUseRecordStatuses)),
    allowNull: false,
    defaultValue: BatchUseRecordStatuses.notConfirmed,
  })
  userAttendStatus: BatchUseRecordStatuses;

  @Column
  reasonForSkip: string;

  @Column({
    defaultValue: 0,
  })
  rating: number;

  @Column
  @ForeignKey(() => RouteUseRecord)
  batchRecordId: number;

  @Column
  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => RouteUseRecord, 'batchRecordId')
  batchRecord: RouteUseRecord;

  @BelongsTo(() => User)
  user: User;

  get routeBatch(): RouteBatch {
    return this.batchRecord ? this.batchRecord.batch : null;
  }
}
