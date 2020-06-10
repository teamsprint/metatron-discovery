export namespace AbstractHistory {

  export class Entity {
    version: number;
    createdBy: UserDetail;
    createdTime: Date;
    modifiedBy: UserDetail;
    modifiedTime: Date;
    lastAccessTime: Date;
  }

  export class UserDetail {
    email: string;
    fullName: string;
    type: string;
    username: string;
  }
}

