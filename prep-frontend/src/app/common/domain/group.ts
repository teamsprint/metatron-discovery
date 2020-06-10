import {AbstractHistory} from './abstract-history-entity';
import {User} from '../../user/domains/user';

export class Group extends AbstractHistory.Entity {

  id: string;
  name: string;
  description: string;
  predefined: boolean;
  memberCount: number;

  // TODO: 타입 확인 후 변경 필요
  // members: any[];
  members: User[];

  readOnly: boolean;
  roleNames: string[] = [];
  contexts: string;
}
