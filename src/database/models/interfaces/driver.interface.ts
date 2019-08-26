import { IUser } from './user.interface';

export interface IDriver {
  driverName?: string;
  driverPhoneNo?: string;
  user?: IUser;
  userId?: number;
  id?: number;
  providerId?: number;
}
