import { Base } from '../base';
import { Table, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './user';
import Partner from './partner';

@Table
export default class Engagement extends Base<Engagement> {
  @Column
  startDate: string;

  @Column
  endDate: string;

  @Column
  workHours: string;

  @ForeignKey(() => Partner)
  partnerId: number;

  @ForeignKey(() => User)
  fellowId: number;

  @BelongsTo(() => Partner)
  partner: Partner;

  @BelongsTo(() => User)
  fellow: User;
}
