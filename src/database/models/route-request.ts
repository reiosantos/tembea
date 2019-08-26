import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Base, enumToStringArray } from '../base';
import Engagement from './engagement';
import User from './user';
import Address from './address';
import Homebase from './homebase';

export enum RouteRequestStatuses {
  pending = 'Pending',
  approved = 'Approved',
  declined = 'Declined',
  confirmed = 'Confirmed',
}

@Table
export default class RouteRequest extends Base<RouteRequest> {
  @Column({
    type: DataType.DOUBLE,
  })
  distance: number;

  @Column
  opsComment: string;

  @Column
  managerComment: string;

  @Column({
    type: DataType.DOUBLE,
  })
  busStopDistance: number;

  @Column
  routeImageUrl: number;

  @Column({
    type: DataType.ENUM(...enumToStringArray(RouteRequestStatuses)),
    allowNull: false,
  })
  status: RouteRequestStatuses;

  @Column
  @ForeignKey(() => Engagement)
  engagementId: number;

  @Column
  @ForeignKey(() => User)
  requesterId: number;

  @Column
  @ForeignKey(() => User)
  managerId: number;

  @Column
  @ForeignKey(() => User)
  opsReviewerId: number;

  @Column
  @ForeignKey(() => Address)
  busStopId: number;

  @Column
  @ForeignKey(() => Address)
  homeId: number;

  @Column
  @ForeignKey(() => Homebase)
  homebaseId: number;

  @BelongsTo(() => Engagement)
  engagement: Engagement;

  @BelongsTo(() => User, 'managerId')
  manager: User;

  @BelongsTo(() => User, 'opsReviewerId')
  opsReviewer: User;

  @BelongsTo(() => User, 'requesterId')
  requester: User;

  @BelongsTo(() => Address, 'busStopId')
  busStop: Address;

  @BelongsTo(() => Address, 'homeId')
  home: Address;

  @BelongsTo(() => Homebase)
  homebase: Homebase;
}
