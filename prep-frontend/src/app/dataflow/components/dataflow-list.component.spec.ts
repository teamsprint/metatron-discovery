import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataflowListComponent } from './dataflow-list.component';

describe('ListComponent', () => {
  let component: DataflowListComponent;
  let fixture: ComponentFixture<DataflowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataflowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataflowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
