import { Table, Column, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Base } from '../base';
import Location from './location';

@Table
export default class Address extends Base<Address> {
  @Column
  address: string;

  @Column
  @ForeignKey(() => Location)
  locationId: number;

  @BelongsTo(() => Location)
  location: Location;
}
