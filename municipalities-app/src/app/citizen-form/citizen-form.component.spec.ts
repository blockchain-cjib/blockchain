import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

import { CitizenFormComponent } from './citizen-form.component';
import { ApiService } from '../_services/api.service';
import { of } from 'rxjs';

describe('CitizenFormComponent', () => {
  let component: CitizenFormComponent;
  let fixture: ComponentFixture<CitizenFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule
      ],
      declarations: [ 
        CitizenFormComponent
      ],
      providers: [
        ApiService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitizenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should properly initialize parameters', () => {
    expect(component.submitted).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.errorAlert).toBe(false);
    expect(component.successAlert).toBe(false);
  })

  it('should set form as invalid if "bsn" is not provided', () => {
    let bsn = component.uploadCitizenForm.controls['bsn'];
    expect(bsn.valid).toBeFalsy();
  })

  it('should set form as invalid if "firstName" is not provided', () => {
    let firstName = component.uploadCitizenForm.controls['firstName'];
    expect(firstName.valid).toBeFalsy();
  })

  it('should set form as invalid if "lastName" is not provided', () => {
    let lastName = component.uploadCitizenForm.controls['lastName'];
    expect(lastName.valid).toBeFalsy();
  })

  it('should set form as invalid if "address" is not provided', () => {
    let address = component.uploadCitizenForm.controls['address'];
    expect(address.valid).toBeFalsy();
  })

  it('should set form as invalid if "financialSupport" is not provided', () => {
    let financialSupport = component.uploadCitizenForm.controls['financialSupport'];
    expect(financialSupport.valid).toBeFalsy();
  })

  it('should set form as invalid if "consent" is not provided', () => {
    let consent = component.uploadCitizenForm.controls['consent'];
    expect(consent.valid).toBeFalsy();
  })

  it('should not invoke the "ApiService" when the form is invalid', inject([ApiService], (service: ApiService) => {
    spyOn(service, 'createCitizenInformation').and.returnValue(of({}));
    component.onSubmit();
    expect(service.createCitizenInformation).not.toHaveBeenCalled();
  }))
  
  it('should invoke the "ApiService" when "createCitizenInformation" gets called', inject([ApiService], (service: ApiService) => {
    let bsn = component.uploadCitizenForm.controls['bsn'];
    let firstName = component.uploadCitizenForm.controls['firstName'];
    let lastName = component.uploadCitizenForm.controls['lastName'];
    let address = component.uploadCitizenForm.controls['address'];
    let financialSupport = component.uploadCitizenForm.controls['financialSupport'];
    let consent = component.uploadCitizenForm.controls['consent'];

    bsn.setValue('12345');
    firstName.setValue('Angelos');
    lastName.setValue('Doe');
    address.setValue('Delft 52');
    financialSupport.setValue(1000);
    consent.setValue('true');

    spyOn(service, 'createCitizenInformation').and.returnValue(of({}));
    component.createCitizenInformation();
    expect(service.createCitizenInformation).toHaveBeenCalled();
  }));

  it('should reset corresponding vars when "closeAlert" gets called', () => {
    component.closeAlert();
    expect(component.errorAlert).toBe(false);
    expect(component.successAlert).toBe(false);
  })

  it('should reset corresponding vars when the API call is successfull', () => {
    component.createCitizenInformationSuccessCallback(null);
    expect(component.loading).toBe(false);
    expect(component.successAlert).toBe(true);
    expect(component.submitted).toBe(false);
  })

  it('should reset corresponding vars when the API call is not successfull', () => {
    component.createCitizenInformationFailCallback(null);
    expect(component.loading).toBe(false);
    expect(component.errorAlert).toBe(true);
    expect(component.submitted).toBe(false);
  })
});
