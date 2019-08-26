import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import Department from './department';

@Table
export default class TeamDetails extends Model<TeamDetails> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.STRING,
  })
  teamId: string;

  @Column({
    unique: true,
    type: DataType.STRING,
    allowNull: false,
  })
  botId: string;

  @Column({
    unique: true,
    type: DataType.STRING,
    allowNull: false,
  })
  botToken: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  teamName: string;

  @Column({
    unique: true,
    type: DataType.STRING,
    allowNull: false,
  })
  teamUrl: string;

  @Column({
    unique: true,
    type: DataType.STRING,
    allowNull: false,
  })
  webhookConfigUrl: string;

  @Column({
    unique: true,
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    unique: true,
    type: DataType.STRING,
    allowNull: false,
  })
  userToken: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  opsChannelId: string;

  @HasMany(() => Department)
  departments: Department[];
}
