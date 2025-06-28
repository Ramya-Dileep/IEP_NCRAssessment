import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideFilterPanelComponent } from './side-filter-panel.component';

describe('SideFilterPanelComponent', () => {
  let component: SideFilterPanelComponent;
  let fixture: ComponentFixture<SideFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideFilterPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SideFilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
