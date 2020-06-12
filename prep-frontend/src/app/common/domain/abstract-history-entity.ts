import {UserDetail} from '../../user/domains/user';

export namespace AbstractHistory {

  export class Entity {
    version: number;
    createdBy: UserDetail;
    createdTime: Date;
    modifiedBy: UserDetail;
    modifiedTime: Date;
    lastAccessTime: Date;
  }
}

