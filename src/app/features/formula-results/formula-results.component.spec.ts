import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaResultsComponent } from './formula-results.component';

describe('FormulaResultsComponent', () => {
  let component: FormulaResultsComponent;
  let fixture: ComponentFixture<FormulaResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
