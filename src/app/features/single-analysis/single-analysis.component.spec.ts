import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleAnalysisComponent } from './single-analysis.component';

describe('SingleAnalysisComponent', () => {
  let component: SingleAnalysisComponent;
  let fixture: ComponentFixture<SingleAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
