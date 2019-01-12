import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

import { QueryCitizenComponent } from './query-citizen.component';
import { ApiService } from '../api.service';
import { of } from 'rxjs';

describe('QueryCitizenComponent', () => {
  let component: QueryCitizenComponent;
  let fixture: ComponentFixture<QueryCitizenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule
      ],
      declarations: [ 
        QueryCitizenComponent 
      ],
      providers: [
        ApiService
      ]
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

  it('should properly initialize parameters', () => {
    expect(component.bsn).toBe(null);
    expect(component.money).toBe(null);
    expect(component.months).toBe(null);
    expect(component.selectedType).toBe(component.queryTypes[0]);
    expect(component.queryTypes.length).toBe(2);
    expect(component.loading).toBe(false);
    expect(component.submitted).toBe(false);
    expect(component.errorAlert).toBe(false);
    expect(component.queryAnswer).toBe(undefined);
  })

  it('should not invoke the "ApiService" when the form is invalid', inject([ApiService], (service: ApiService) => {
    component.selectedType.id = 2;
    spyOn(service, 'queryCitizenAbilityToPay').and.returnValue(of({}));
    component.onSubmit(1234, 1, 1);
    expect(service.queryCitizenAbilityToPay).not.toHaveBeenCalled();
  }))

  it('should invoke the "ApiService" when "createCitizenInformation" gets called', inject([ApiService], (service: ApiService) => {
    let bsn = component.queryCitizenForm.controls['bsn'];
    let money = component.queryCitizenForm.controls['money'];
    
    let bsn2 = component.queryCitizenForm2.controls['bsn'];
    let money2 = component.queryCitizenForm2.controls['money'];
    let months2 = component.queryCitizenForm2.controls['months'];

    bsn2.setValue('12345');
    money2.setValue(1000);
    months2.setValue(12);

    spyOn(service, 'queryCitizenAbilityToPay').and.returnValue(of({}));
    component.queryCitizenAbilityToPay(bsn2, money2, months2);
    expect(service.queryCitizenAbilityToPay).toHaveBeenCalledWith(bsn2, money2, months2);
  }));

  it('should set form as invalid if "bsn" at query type 1 is not provided', () => {
    let bsn = component.queryCitizenForm.controls['bsn'];
    expect(bsn.valid).toBeFalsy();
  })

  it('should set form as invalid if "money" at query type 1 is not provided', () => {
    let money = component.queryCitizenForm.controls['money'];
    expect(money.valid).toBeFalsy();
  })
  
  it('should set form as invalid if "bsn" at query type 2 is not provided', () => {
    let bsn = component.queryCitizenForm2.controls['bsn'];
    expect(bsn.valid).toBeFalsy();
  })

  it('should set form as invalid if "money" at query type 2 is not provided', () => {
    let money = component.queryCitizenForm2.controls['money'];
    expect(money.valid).toBeFalsy();
  })

  it('should set form as invalid if "months" at query type 2 is not provided', () => {
    let months = component.queryCitizenForm2.controls['months'];
    expect(months.valid).toBeFalsy();
  })

  it('should reset corresponding vars when "closeAlert" gets called', () => {
    component.closeAlert();
    expect(component.errorAlert).toBe(false);
  })

  it('should reset corresponding vars when "queryTypeChanged" gets called', () => {
    component.money = 1000;
    component.months = 1;
    component.submitted = true;
    component.errorAlert = true;
    component.queryAnswer = {answer: null};

    component.queryTypeChanged();
    
    expect(component.money).toBe(null);
    expect(component.months).toBe(null);
    expect(component.submitted).toBe(false);
    expect(component.errorAlert).toBe(false);
    expect(component.queryAnswer).toBe(undefined);
  })

  it('should reset corresponding vars and set the queryAnswer when the API call is successfull', () => {
    component.queryCitizenAbilityToPaySuccessCallback({answer: true});
    expect(component.loading).toBe(false);
    expect(component.queryAnswer).toBe(true);
  })

  it('should set the queryAnswer to null if a 404 error was thrown', () => {
    component.queryCitizenAbilityToPayFailCallback({status: 404});
    expect(component.errorAlert).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.queryAnswer).toBe(null);
  })

  it('should reset corresponding vars and set the queryAnswer when the API call is NOT successfull', () => {
    component.queryCitizenAbilityToPayFailCallback({status: 500});
    expect(component.errorAlert).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.queryAnswer).toBe(undefined);
  })
});
 