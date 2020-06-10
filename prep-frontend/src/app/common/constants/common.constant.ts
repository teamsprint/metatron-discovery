class APIConstant {
  readonly API_URL = '/api';
  readonly OAUTH_URL = '/oauth';
  readonly TIMEOUT = 5000;
  readonly PAGE_SIZE = 20;
  readonly PAGE_SORT_MODIFIED_TIME_DESC = 'modifiedTime,desc';
}

export class CommonConstant {
  public static readonly API_CONSTANT = new APIConstant();
}
