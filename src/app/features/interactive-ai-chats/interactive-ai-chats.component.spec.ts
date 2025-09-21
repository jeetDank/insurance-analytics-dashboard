import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveAiChatsComponent } from './interactive-ai-chats.component';

describe('InteractiveAiChatsComponent', () => {
  let component: InteractiveAiChatsComponent;
  let fixture: ComponentFixture<InteractiveAiChatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveAiChatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractiveAiChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
