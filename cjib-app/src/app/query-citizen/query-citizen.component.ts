import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  	selector: 'app-query-citizen',
  	templateUrl: './query-citizen.component.html',
  	styleUrls: ['./query-citizen.component.css']
})
export class QueryCitizenComponent implements OnInit {
    queryCitizenForm: FormGroup;
    queryCitizenForm2: FormGroup;

	bsn = null;
	money = null;
	months = null;
	selectedType = null;
	queryTypes = [];
	loading = false;
    submitted = false;
    errorAlert = false;
    queryAnswer = undefined;

  	constructor(private apiService: ApiService, private formBuilder: FormBuilder) { 
    	this.queryTypes = [
			{id: 1, text: "Can person pay X?"},
			{id: 2, text: "Can person pay X in Y months?"},
			{id: 3, text: "Does person earn more than X?"}
		]
  	}

  	ngOnInit() {
        this.selectedType = this.queryTypes[0];
        
        this.queryCitizenForm = this.formBuilder.group({
            bsn: ['', Validators.required],
            money: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
        });
        this.queryCitizenForm2 = this.formBuilder.group({
            bsn: ['', Validators.required],
            money: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            months: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
        });
    }
    
    onSubmit() {
        this.submitted = true;

        if (this.selectedType.id === 2) {
            if (this.queryCitizenForm2.invalid) return;
        } else {
            if (this.queryCitizenForm.invalid) return;
        }
        this.queryCitizenAbilityToPay();
    }
    
    get f() { return this.queryCitizenForm.controls; }
    get f2() { return this.queryCitizenForm2.controls; }

	closeAlert = function() {
		this.errorAlert = false;
	}

	queryTypeChanged = function() {
		this.money = null;
        this.months = null;
        this.submitted = false;
        this.errorAlert = false;

        this.queryCitizenForm.reset();
        this.queryCitizenForm2.reset();
	}

	queryCitizenAbilityToPay = function() {
        this.closeAlert();
        this.loading = true;
        
        var body: any = {
            fineAmount: this.money,
            bsn: this.bsn
        }
        if (this.months) {
            body.months = this.months;
        }

		this.apiService.queryCitizenAbilityToPay(body)
		.subscribe(
			res => this.queryCitizenAbilityToPaySuccessCallback(res),
			err => this.queryCitizenAbilityToPayFailCallback(err));
	}

	queryCitizenAbilityToPaySuccessCallback(result) {
        this.loading = false;
        if (result.answer === 'true') {
            this.queryAnswer = true;
        } else if (result.answer === 'false') {
            this.queryAnswer = false;
        } else {
            this.queryAnswer = null;
        }
	}

	queryCitizenAbilityToPayFailCallback(error) {
		this.errorAlert = true;
		this.loading = false;
    }
}
