import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeDotPopupComponent } from './three-dot-popup.component';

describe('ThreeDotPopupComponent', () => {
  let component: ThreeDotPopupComponent;
  let fixture: ComponentFixture<ThreeDotPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeDotPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreeDotPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
