import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanticTestingComponent } from './semantic-testing.component';

describe('SemanticTestingComponent', () => {
  let component: SemanticTestingComponent;
  let fixture: ComponentFixture<SemanticTestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemanticTestingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanticTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
