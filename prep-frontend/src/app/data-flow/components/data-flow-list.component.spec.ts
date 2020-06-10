import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFlowListComponent } from './data-flow-list.component';

describe('ListComponent', () => {
  let component: DataFlowListComponent;
  let fixture: ComponentFixture<DataFlowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFlowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFlowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
