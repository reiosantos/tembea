import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Base, enumToStringArray } from '../base';
import User from './user';
import Address from './address';
import TripDetail from './trip-details';
import Driver from './driver';
import Cab from './cab';
import Provider from './provider';
import Department from './department';
import Homebase from './homebase';
import { ITripRequest } from './interfaces/trip-request.interface';

export enum TripTypes {
  regular = 'RegularTrip',
  airportTransfer = 'AirportTransfer',
  embassyVisit = 'EmbassyVisit',
}

export enum TripStatus {
  pending = 'Pending',
  approved = 'Approved',
  confirmed = 'Confirmed',
  inTransit = 'InTransit',
  cancelled = 'Cancelled',
  completed = 'Completed',
  declinedByOps = 'DeclinedByOps',
}

@Table({
  timestamp: true,
})
export default class TripRequest extends Base<TripRequest> implements ITripRequest {
  @Column({
    allowNull: false,
  })
  name: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  reason: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...enumToStringArray(TripTypes)),
  })
  tripType: TripTypes;

  @Column({
    defaultValue: 1,
  })
  noOfPassengers: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM(...enumToStringArray(TripStatus)),
  })
  tripStatus: TripStatus;

  @Column
  distance: string;

  @Column(DataType.FLOAT)
  cost: number;

  @Column(DataType.TEXT)
  operationsComment: string;

  @Column(DataType.TEXT)
  managerComment: string;

  @Column(DataType.TEXT)
  tripNotTakenReason: string;

  @Column(DataType.TEXT)
  tripNote: string;

  @Column
  rating: number;

  @Column
  approvalDate: string;

  @Column({
    allowNull: false,
  })
  departureTime: string;

  @Column
  arrivalTime: string;

  // foreign keys
  @Column
  @ForeignKey(() => User)
  requestedById: number;

  @Column
  @ForeignKey(() => User)
  riderId: number;

  @Column
  @ForeignKey(() => User)
  approvedById: number;

  @Column
  @ForeignKey(() => User)
  confirmedById: number;

  @Column
  @ForeignKey(() => User)
  declinedById: number;

  @Column
  @ForeignKey(() => Address)
  originId: number;

  @Column
  @ForeignKey(() => Address)
  destinationId: number;

  @Column
  @ForeignKey(() => TripDetail)
  tripDetailId: number;

  @Column
  @ForeignKey(() => Provider)
  providerId: number;

  @Column
  @ForeignKey(() => Cab)
  cabId: number;

  @Column
  @ForeignKey(() => Driver)
  driverId: number;

  @Column
  @ForeignKey(() => Department)
  departmentId: number;

  @Column
  @ForeignKey(() => Homebase)
  homebaseId: number;

  // ref props
  @BelongsTo(() => User, 'requestedById')
  requester: User;

  @BelongsTo(() => User, 'riderId')
  rider: User;

  @BelongsTo(() => User, 'approvedById')
  approver: User;

  @BelongsTo(() => User, 'confirmedById')
  confirmer: User;

  @BelongsTo(() => User, 'declinedById')
  decliner: User;

  @BelongsTo(() => Address, 'originId')
  origin: Address;

  @BelongsTo(() => Address, 'destinationId')
  destination: Address;

  @BelongsTo(() => TripDetail)
  tripDetail: TripDetail;

  @BelongsTo(() => Provider)
  provider: Provider;

  @BelongsTo(() => Cab)
  cab: Cab;

  @BelongsTo(() => Driver)
  driver: Driver;

  @BelongsTo(() => Department)
  department: Department;

  @BelongsTo(() => Homebase)
  homebase: Homebase;
}
