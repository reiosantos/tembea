import { Table, Column, ForeignKey, BelongsTo, BelongsToMany,
  DataType,
  HasMany} from 'sequelize-typescript';
import { Base } from '../base';
import Role from './role';
import UserRole from './user-role';
import Partner from './partner';
import Engagement from './engagement';
import Address from './address';
import RouteBatch from './route-batch';
import Homebase from './homebase';
import { IUser } from './interfaces/user.interface';
import TripRequest from './trip-request';

@Table
export default class User extends Base<User> implements IUser {
  // primary menbers
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  name: string;

  @Column({
    allowNull: false,
    unique: true,
    type: DataType.STRING,
  })
  slackId: string;

  @Column({
    allowNull: true,
    unique: true,
    type: DataType.STRING,
  })
  phoneNo: string;

  @Column({
    unique: true,
    type: DataType.STRING,
  })
  email: string;

  // foreign keys
  @Column
  @ForeignKey(() => Address)
  defaultDestinationId: number;

  @Column
  @ForeignKey(() => RouteBatch)
  routeBatchId: number;

  @Column
  @ForeignKey(() => Homebase)
  homebaseId: number;

  // relationships
  @BelongsTo(() => Address, 'defaultDestinationId')
  busStop: number;

  @BelongsTo(() => RouteBatch)
  routeBatch: RouteBatch;

  @BelongsTo(() => Homebase)
  homebase: Homebase;

  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];

  @BelongsToMany(() => Partner, () => Engagement)
  partners: Partner[];

  @HasMany(() => TripRequest, 'requestedById')
  trips: TripRequest[];

  get partner(): Partner {
    return this.partners && Array.isArray(this.partners) ? this.partners[0] : null;
  }
}
