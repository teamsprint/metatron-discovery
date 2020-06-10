import {TestBed} from '@angular/core/testing';

import {DataFlowService} from './data-flow.service';

describe('DataFlowService', () => {
  let service: DataFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
