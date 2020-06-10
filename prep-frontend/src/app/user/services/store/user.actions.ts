import {User} from '../../domains/user';

export class AddUser {
  static readonly type = '[User] Add User';
  constructor(public readonly user: User) {}
}
