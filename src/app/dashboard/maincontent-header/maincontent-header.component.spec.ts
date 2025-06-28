import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaincontentHeaderComponent } from './maincontent-header.component';

describe('MaincontentHeaderComponent', () => {
  let component: MaincontentHeaderComponent;
  let fixture: ComponentFixture<MaincontentHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaincontentHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaincontentHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
