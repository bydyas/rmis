import { TRole } from '../enums/role.enum';

export interface IUser {
  id: string;
  email: string;
  password: string;
  role: TRole;
}
