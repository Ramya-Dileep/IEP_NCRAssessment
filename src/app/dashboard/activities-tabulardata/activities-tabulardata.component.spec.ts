import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesTabulardataComponent } from './activities-tabulardata.component';

describe('ActivitiesTabulardataComponent', () => {
  let component: ActivitiesTabulardataComponent;
  let fixture: ComponentFixture<ActivitiesTabulardataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesTabulardataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivitiesTabulardataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
