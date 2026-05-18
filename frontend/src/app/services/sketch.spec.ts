import { TestBed } from '@angular/core/testing';

import { Sketch } from './sketch';

describe('Sketch', () => {
  let service: Sketch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sketch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
