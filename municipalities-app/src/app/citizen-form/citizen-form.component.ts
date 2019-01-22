import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../_services/api.service';

@Component({
  selector: 'app-citizen-form',
  templateUrl: './citizen-form.component.html',
  styleUrls: ['./citizen-form.component.css']
})
export class CitizenFormComponent implements OnInit {
    mockMunicipalityId = '1';
    uploadCitizenForm: FormGroup;

    submitted = false;
    loading = false;
    errorAlert = false;
    successAlert = false;

    person = {
        bsn: undefined,
        firstName: undefined,
        lastName: undefined,
        address: undefined,
        financialSupport: undefined,
        fineAmount: undefined,
        consent: 'false',
        municipalityId: this.mockMunicipalityId
    }
  
    constructor(private apiService: ApiService, private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.uploadCitizenForm = this.formBuilder.group({
            bsn: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            address: ['', [Validators.required]],
            financialSupport: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            fineAmount: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            consent: [false, [Validators.requiredTrue]]
        });
    }

    onSubmit() {
        this.submitted = true;

        if (this.uploadCitizenForm.invalid) {
            return;
        } 
        this.createCitizenInformation();
    }

    get f() { return this.uploadCitizenForm.controls; }

    closeAlert = function() {
		this.errorAlert = false;
		this.successAlert = false;
    }

    createCitizenInformation(): void {
        this.loading = true;
        this.closeAlert();

        this.person.bsn = this.f.bsn.value;
        this.person.firstName = this.f.firstName.value;
        this.person.lastName = this.f.lastName.value;
        this.person.address = this.f.address.value;
        this.person.financialSupport = this.f.financialSupport.value;
        this.person.fineAmount = this.f.fineAmount.value;
        this.person.consent = String(this.f.consent.value);

        this.apiService.createCitizenInformation(this.person)
        .subscribe(
            res => this.createCitizenInformationSuccessCallback(res),
            err => this.createCitizenInformationFailCallback(err)
        );
    }

    createCitizenInformationSuccessCallback (result) {
        this.loading = false;
        this.successAlert = true;
        this.submitted = false;
    }

    createCitizenInformationFailCallback(error) {
        this.loading = false;
        this.errorAlert = true;
        this.submitted = false;
    }
}
