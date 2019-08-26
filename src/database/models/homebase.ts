import { Table, Model, Column, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Country from './country';
import User from './user';

@Table({
  paranoid: true,
  timestamps: true,
})
export default class Homebase extends Model<Homebase> {
  @Column({
    unique: true,
  })
  name: string;

  @ForeignKey(() =>  Country)
  @Column
  countryId: number;

  @BelongsTo(() => Country, {
    onDelete: 'cascade',
    hooks: true,
  })
  country: Country;

  @Column
  channel: string;

  @HasMany(() => User, 'homebaseId')
  users: User[];
}
