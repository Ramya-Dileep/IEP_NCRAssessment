import { TestBed } from '@angular/core/testing';

import { TabulardataService } from './tabulardata.service';

describe('TabulardataService', () => {
  let service: TabulardataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabulardataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
