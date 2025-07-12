import { TestBed } from '@angular/core/testing';

import { ChartdataService } from './chartdata.service';

describe('ChartdataService', () => {
  let service: ChartdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
