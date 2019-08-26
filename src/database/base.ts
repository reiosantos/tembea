import { Model, Column } from 'sequelize-typescript';

export class Base<T> extends Model<T> {
  @Column({
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
}

export const enumToStringArray = (enumType: any): string[] => Object.values(enumType);
