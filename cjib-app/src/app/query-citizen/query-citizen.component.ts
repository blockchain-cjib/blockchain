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

  queryTypeChanged = function () {
    this.money = null;
    this.months = null;
  }

  queryCitizenAbilityToPay = function() {
    this.apiService.queryCitizenAbilityToPay(this.money, this.bsn)
    .subscribe(result => {
      console.log(result)
    });
  }
}
