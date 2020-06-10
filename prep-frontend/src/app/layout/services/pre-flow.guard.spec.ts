import { TestBed } from '@angular/core/testing';

import { PreFlowGuard } from './pre-flow.guard';

describe('PreFlowGuard', () => {
  let guard: PreFlowGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PreFlowGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
