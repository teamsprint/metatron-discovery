import {Injectable} from '@angular/core';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {AddUser} from './user.actions';
import {User} from '../../domains/user';

interface UserState {
  user: User;
}

@State<UserState>({
  name: 'users',
  defaults: { user: undefined }
})
@Injectable()
export class UserStore {

  @Selector()
  static get(state: UserState): User | undefined {
    return state.user;
  }

  @Selector()
  static getUserFullName(state: UserState): User | string | undefined {
    return (state.user && state.user.fullName) ? state.user.fullName : 'Metatron';
  }

  @Action(AddUser)
  add({ patchState }: StateContext<UserState>, { user }: AddUser) {
    patchState({ user });
  }
}
