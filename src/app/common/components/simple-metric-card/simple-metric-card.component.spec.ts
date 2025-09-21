import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleMetricCardComponent } from './simple-metric-card.component';

describe('SimpleMetricCardComponent', () => {
  let component: SimpleMetricCardComponent;
  let fixture: ComponentFixture<SimpleMetricCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleMetricCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleMetricCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
