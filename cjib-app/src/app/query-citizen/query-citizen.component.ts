import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  	selector: 'app-query-citizen',
  	templateUrl: './query-citizen.component.html',
  	styleUrls: ['./query-citizen.component.css']
})
export class QueryCitizenComponent implements OnInit {
	bsn = null;
	money = null;
	months = null;
	selectedType = null;
	queryTypes = [];
	loading = false;
    errorAlert = false;
    queryAnswer = undefined;

  	constructor(private apiService: ApiService) { 
    	this.queryTypes = [
			{id: 1, text: "Can person pay X?"},
			{id: 2, text: "Can person pay X in Y months?"},
			{id: 3, text: "Does person earn more than X?"}
		]
  	}

  	ngOnInit() {
    	this.selectedType = this.queryTypes[0];
	}
	  
	closeAlert = function() {
		this.errorAlert = false;
	}

	queryTypeChanged = function() {
		this.money = null;
		this.months = null;
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
