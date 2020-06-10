export class UserRouterUrl {
  public static readonly ROOT = 'user';
  public static readonly LOGIN = 'login';

  public static getLoginUrl() {
    return `${UserRouterUrl.ROOT}/${UserRouterUrl.LOGIN}`;
  }
}
