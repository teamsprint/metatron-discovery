import { v4 as uuidv4 } from 'uuid';

export namespace CommonUtil {
  export class Generate {
    public static makeUUID() {
      return uuidv4();
    }
  }
}
