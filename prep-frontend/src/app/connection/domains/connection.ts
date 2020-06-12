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

  export class ConnectionCheck {
    connected: boolean;
  }

  export enum ConnType {
    API = 'API',
    DATABASE = 'DATABASE'
  }

  export enum ConnectionValid {
    ENABLE_CONNECTION = 0,
    DISABLE_CONNECTION = 1,
    REQUIRE_CONNECTION_CHECK = 2
  }

}
