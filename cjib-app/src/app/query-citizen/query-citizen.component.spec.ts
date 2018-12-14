import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCitizenComponent } from './query-citizen.component';

describe('QueryCitizenComponent', () => {
  let component: QueryCitizenComponent;
  let fixture: ComponentFixture<QueryCitizenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryCitizenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCitizenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
