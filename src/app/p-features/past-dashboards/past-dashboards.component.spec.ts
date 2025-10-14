import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastDashboardsComponent } from './past-dashboards.component';

describe('PastDashboardsComponent', () => {
  let component: PastDashboardsComponent;
  let fixture: ComponentFixture<PastDashboardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastDashboardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PastDashboardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
