export type SessionMeta = {
  ip_address?: string | null;
  user_agent?: string | null;
  device_name?: string | null;
  platform?: string | null;
  browser?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  userId: string;
  tokens: AuthTokens;
};