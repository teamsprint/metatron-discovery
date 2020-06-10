import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateConnectionComponent} from './create-connection.component';

describe('CreateConnectionComponent', () => {
  let component: CreateConnectionComponent;
  let fixture: ComponentFixture<CreateConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateConnectionComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
