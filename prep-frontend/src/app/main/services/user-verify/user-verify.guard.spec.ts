import {TestBed} from '@angular/core/testing';

import {UserVerifyGuard} from './user-verify.guard';

describe('UserVerifyGuard', () => {
  let guard: UserVerifyGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UserVerifyGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
