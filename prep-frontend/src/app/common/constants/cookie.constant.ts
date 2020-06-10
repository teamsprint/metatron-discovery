class CookieKey {
  public readonly LOGIN_TOKEN = 'LOGIN_TOKEN';
  public readonly LOGIN_TOKEN_TYPE = 'LOGIN_TOKEN_TYPE';
  public readonly REFRESH_LOGIN_TOKEN = 'REFRESH_LOGIN_TOKEN';
  public readonly LOGIN_USER_ID = 'LOGIN_USER_ID';
}

export class CookieConstant {
  public static readonly KEY = new CookieKey();
}
