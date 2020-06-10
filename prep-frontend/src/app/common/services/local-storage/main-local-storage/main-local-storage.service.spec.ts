import { TestBed } from '@angular/core/testing';

import { MainLocalStorageService } from './main-local-storage.service';

describe('MainLocalStorageService', () => {
  let service: MainLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
