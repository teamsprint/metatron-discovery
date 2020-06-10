import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NoneLayoutComponent} from './none-layout.component';

describe('NoneLayoutComponent', () => {
  let component: NoneLayoutComponent;
  let fixture: ComponentFixture<NoneLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NoneLayoutComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoneLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
