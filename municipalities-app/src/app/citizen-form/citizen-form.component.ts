import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { PersonInfo } from '../../org.example.cjibnetwork';

@Component({
  selector: 'app-citizen-form',
  templateUrl: './citizen-form.component.html',
  styleUrls: ['./citizen-form.component.css']
})
export class CitizenFormComponent implements OnInit {
    mockMunicipalityId = "1";
    uploadCitizenForm: FormGroup;

    submitted = false;
    loading = false;
    errorAlert = false;
    successAlert = false;

    person = {
        BSN: undefined,
        firstName: undefined,
        lastName: undefined,
        address: undefined,
        financialSupport: undefined,
        consent: false,
        owner: "org.example.cjibnetwork.Municipality#" + this.mockMunicipalityId
    }
  
    persons: PersonInfo[];
    
    constructor(private apiService: ApiService, private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.uploadCitizenForm = this.formBuilder.group({
            bsn: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            address: ['', [Validators.required]],
            financialSupport: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            consent: [false, [Validators.requiredTrue]]
        });
    }

    onSubmit() {
        this.submitted = true;

        if (this.uploadCitizenForm.invalid) {
            return;
        } 
        this.uploadPersonInformation();
    }

    get f() { return this.uploadCitizenForm.controls; }

    closeAlert = function() {
		this.errorAlert = false;
		this.successAlert = false;
    }
    
    getAllPersonInformation(): void {
        this.apiService.getAllPersonInformation()
            .subscribe(persons => this.persons = persons);
    }

    uploadPersonInformation(): void {
        this.loading = true;
        this.closeAlert();

        this.person.BSN = this.f.bsn.value;
        this.person.firstName = this.f.firstName.value;
        this.person.lastName = this.f.lastName.value;
        this.person.address = this.f.address.value;
        this.person.financialSupport = this.f.financialSupport.value;
        this.person.consent = this.f.consent.value;

        var body = {
            personinfo: this.person
        }

        this.apiService.uploadPersonInformation(body)
        .subscribe(
            res => this.uploadPersonInformationSuccessCallback(res),
            err => this.uploadPersonInformationFailCallback(err)
        );
    }

    uploadPersonInformationSuccessCallback (result) {
        this.loading = false;
        this.successAlert = true;
        this.submitted = false;
    }

    uploadPersonInformationFailCallback(error) {
        this.loading = false;
        this.errorAlert = true;
        this.submitted = false;
    }
}
