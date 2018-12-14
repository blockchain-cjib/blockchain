import { Component, OnInit } from '@angular/core';

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

  constructor() { 
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
}
