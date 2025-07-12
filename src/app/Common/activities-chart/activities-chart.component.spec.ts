import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesChartComponent } from './activities-chart.component';

describe('ActivitiesChartComponent', () => {
  let component: ActivitiesChartComponent;
  let fixture: ComponentFixture<ActivitiesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivitiesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
