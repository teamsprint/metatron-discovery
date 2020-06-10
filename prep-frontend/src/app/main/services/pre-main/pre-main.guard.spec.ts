import { TestBed } from '@angular/core/testing';

import { PreMainGuard } from './pre-main.guard';

describe('PreMainGuard', () => {
  let guard: PreMainGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PreMainGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
