import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterActivitiesComponent } from './filter-activities.component';

describe('FilterActivitiesComponent', () => {
  let component: FilterActivitiesComponent;
  let fixture: ComponentFixture<FilterActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterActivitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilterActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
