import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataflowDetailComponent } from './dataflow-detail.component';

describe('DetailComponent', () => {
  let component: DataflowDetailComponent;
  let fixture: ComponentFixture<DataflowDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataflowDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataflowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
