import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonContainerComponent } from './common-container.component';

describe('CommonContainerComponent', () => {
  let component: CommonContainerComponent;
  let fixture: ComponentFixture<CommonContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
