export interface ISessionToken {
  sub: string;
}

export interface ISessionResult {
  accessToken: string;
  sessionId: string;
  expires: number;
}
