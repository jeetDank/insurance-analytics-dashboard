import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskAiAnythingComponent } from './ask-ai-anything.component';

describe('AskAiAnythingComponent', () => {
  let component: AskAiAnythingComponent;
  let fixture: ComponentFixture<AskAiAnythingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskAiAnythingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AskAiAnythingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
