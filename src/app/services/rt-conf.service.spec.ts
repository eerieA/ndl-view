import { TestBed } from '@angular/core/testing';

import { RtConfService } from './rt-conf.service';

describe('RtConfService', () => {
  let service: RtConfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RtConfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
