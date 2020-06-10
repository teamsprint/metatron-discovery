import {AbstractHistory} from '../../common/domain/abstract-history-entity';
import {Group} from '../../common/domain/group';

export class User extends AbstractHistory.Entity {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  tel: string;
  status: Status;
  statusMessage: string;
  imageUrl: string;
  groups: Group[];
  op: Action;
  roleNames: string[] = [];
  confirmPassword: string;
}

export enum Status {
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED',
  REQUESTED = 'REQUESTED',
  ACTIVATED = 'ACTIVATED',
}

export enum Action {
  add = 'ADD',
  remove = 'REMOVE'
}
