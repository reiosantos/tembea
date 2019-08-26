import { Base } from '../base';
import { Column, ForeignKey, BelongsTo, Table } from 'sequelize-typescript';
import Provider from './provider';
import { ICab } from './interfaces/cab.interface';

@Table({
  paranoid: true,
  timestamps: true,
})
export default class Cab extends Base<Cab> implements ICab {
  @Column
  regNumber: string;

  @Column
  capacity: number;

  @Column
  model: string;

  @Column
  @ForeignKey(() => Provider)
  providerId: number;

  @BelongsTo(() => Provider)
  provider: Provider;
}
