import { TestBed } from '@angular/core/testing';

import { StudentDatabaseServiceService } from './student-database-service.service';

describe('StudentDatabaseServiceService', () => {
  let service: StudentDatabaseServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentDatabaseServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
