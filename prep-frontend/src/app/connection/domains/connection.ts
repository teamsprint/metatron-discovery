import {AbstractHistory} from '../../common/domain/abstract-history-entity';

export namespace Connection {

  export class Entity extends AbstractHistory.Entity {
    connId: string;
    name: string;
    description: string;
    implementor: string;
    hostname: string;
    port: string;
    database: string;
    catalog: string;
    sid: string;
    url: string;
    username: string;
    password: string;
    connType: ConnType;
    modifySubYn: string;
  }

  export enum ConnType {
    API = 'API',
    DATABASE = 'DATABASE'
  }
}
