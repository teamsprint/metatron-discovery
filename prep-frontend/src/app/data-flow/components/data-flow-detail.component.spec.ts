import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFlowDetailComponent } from './data-flow-detail.component';

describe('DetailComponent', () => {
  let component: DataFlowDetailComponent;
  let fixture: ComponentFixture<DataFlowDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFlowDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFlowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
