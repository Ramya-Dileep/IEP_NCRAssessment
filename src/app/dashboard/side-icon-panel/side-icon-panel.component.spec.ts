import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideIconPanelComponent } from './side-icon-panel.component';

describe('SideIconPanelComponent', () => {
  let component: SideIconPanelComponent;
  let fixture: ComponentFixture<SideIconPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideIconPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SideIconPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
