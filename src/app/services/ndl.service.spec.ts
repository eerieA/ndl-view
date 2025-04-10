import { TestBed } from '@angular/core/testing';

import { NdlService } from './ndl.service';

describe('NdlService', () => {
  let service: NdlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NdlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
