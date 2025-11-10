import { TestBed } from '@angular/core/testing';

import { DataDebugService } from './data-debug.service';

describe('DataDebugService', () => {
  let service: DataDebugService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataDebugService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
