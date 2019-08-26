import { Base } from '../base';
import { Column, Table } from 'sequelize-typescript';

@Table
export default class TripDetail extends Base<TripDetail> {
  @Column
  riderPhoneNo: string;

  @Column
  travelTeamPhoneNo: string;

  @Column
  flightNumber: string;
}
