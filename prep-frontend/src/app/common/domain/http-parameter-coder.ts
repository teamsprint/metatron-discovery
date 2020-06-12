import {HttpParameterCodec} from '@angular/common/http';

export class HttpParameterCoder implements HttpParameterCodec {

  decodeKey(key: string): string {
    return key;
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }

  encodeKey(key: string): string {
    return key;
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }
}
