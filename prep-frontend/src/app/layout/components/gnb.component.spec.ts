import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GnbComponent } from './gnb.component';

describe('GnbComponent', () => {
  let component: GnbComponent;
  let fixture: ComponentFixture<GnbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GnbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GnbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
