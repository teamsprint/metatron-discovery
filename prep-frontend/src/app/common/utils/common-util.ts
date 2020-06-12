import {v4 as uuidv4} from 'uuid';
import * as _ from 'lodash';
import {HttpParams} from '@angular/common/http';
import {HttpParameterCoder} from '../domain/http-parameter-coder';

export namespace CommonUtil {

  export class Generate {
    public static makeUUID() {
      return uuidv4();
    }
  }

  export class Http {

    public static readonly HTTP_PARAMETER_CODER = new HttpParameterCoder();

    public static objectToUrlString(obj: object, enableEncode = false) {
      if (obj) {
        let params = '';
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            params += `${_.isEmpty(params) ? '' : '&'}${key}=${enableEncode ? encodeURIComponent(obj[ key ]) : obj[ key ]}`;
          }
        }
        if (_.startsWith(params, '&')) {
          params = params.substring(1);
        }
        return params;
      }
      return '';
    }

    public static makeQueryString(obj: object) {
      return new HttpParams({
        encoder: this.HTTP_PARAMETER_CODER,
        fromString: CommonUtil.Http.objectToUrlString(obj)
      });
    }
  }
}
