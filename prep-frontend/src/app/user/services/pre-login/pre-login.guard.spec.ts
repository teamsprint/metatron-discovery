import {TestBed} from '@angular/core/testing';

import {PreLoginGuard} from './pre-login.guard';

describe('PreLoginGuard', () => {
  let guard: PreLoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PreLoginGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
