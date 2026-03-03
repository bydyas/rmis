import { TRole } from 'src/users/enums/role.enum';

export interface IAuthTokenPayload {
  sub: string;
  role: TRole;
}

export interface IAuthResult {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthBody {
  accessToken: string;
}
