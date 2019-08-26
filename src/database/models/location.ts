import { Table, Column, DataType, HasOne } from 'sequelize-typescript';
import { Base } from '../base';
import Address from './address';

@Table
export default class Location extends Base<Location> {
  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  longitude: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  latitude: number;

  @HasOne(() => Address)
  address: Address;
}
