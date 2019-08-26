import { Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Base, enumToStringArray } from '../base';
import RouteBatch from './route-batch';
import User from './user';
import Engagement from './engagement';

export enum JoinRequestStatuses {
  pending = 'Pending',
  approved = 'Approved',
  declined = 'Declined',
  confirmed = 'Confirmed',
}

@Table
export default class JoinRequest extends Base<JoinRequest> {
  @Column
  managerComment: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...enumToStringArray(JoinRequestStatuses)),
  })
  status: JoinRequestStatuses;

  @Column
  @ForeignKey(() => Engagement)
  engagementId: number;

  @Column
  @ForeignKey(() => RouteBatch)
  routeBatchId: number;

  @Column
  @ForeignKey(() => User)
  managerId: number;

  @BelongsTo(() => Engagement)
  engagement: Engagement;

  @BelongsTo(() => RouteBatch)
  routeBatch: RouteBatch;

  @BelongsTo(() => User)
  manager: User;
}
