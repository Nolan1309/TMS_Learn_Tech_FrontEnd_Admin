export interface JwtPayload {
  AccountId: number;
  isUserVip: boolean;
  isHuitStudent: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  sub: string; // email
  iat: number;
  exp: number;
}

export default JwtPayload;
