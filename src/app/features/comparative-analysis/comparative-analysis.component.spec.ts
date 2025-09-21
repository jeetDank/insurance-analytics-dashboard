import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparativeAnalysisComponent } from './comparative-analysis.component';

describe('ComparativeAnalysisComponent', () => {
  let component: ComparativeAnalysisComponent;
  let fixture: ComponentFixture<ComparativeAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparativeAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparativeAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
