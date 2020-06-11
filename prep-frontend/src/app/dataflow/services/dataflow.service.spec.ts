import {TestBed} from '@angular/core/testing';

import {DataflowService} from './dataflow.service';

describe('DataflowService', () => {
  let service: DataflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
