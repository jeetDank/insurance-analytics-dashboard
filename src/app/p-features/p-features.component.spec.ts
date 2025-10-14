import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PFeaturesComponent } from './p-features.component';

describe('PFeaturesComponent', () => {
  let component: PFeaturesComponent;
  let fixture: ComponentFixture<PFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
