import { TestBed } from '@angular/core/testing';

import { JobResultService } from './job-result.service';

describe('JobResultService', () => {
  let service: JobResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
