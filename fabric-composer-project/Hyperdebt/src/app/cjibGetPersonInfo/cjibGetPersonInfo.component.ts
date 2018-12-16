/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { cjibGetPersonInfoService } from './cjibGetPersonInfo.service';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-cjibgetpersoninfo',
  templateUrl: './cjibGetPersonInfo.component.html',
  styleUrls: ['./cjibGetPersonInfo.component.css'],
  providers: [cjibGetPersonInfoService]
})
export class cjibGetPersonInfoComponent implements OnInit {

  myForm: FormGroup;

  private allTransactions;
  private Transaction;
  private currentId;
  private errorMessage;

  bsn = null;
  money = null;
  months = null;
  selectedType = null;

  // fineAmount = new FormControl('', Validators.required);
  // bsn = new FormControl('', Validators.required);
  // transactionId = new FormControl('', Validators.required);
  // timestamp = new FormControl('', Validators.required);
  queryTypes = [];

  constructor(private servicecjibGetPersonInfo: cjibGetPersonInfoService) {
    this.queryTypes = [
      {id: 1, text: "Can person pay X?"},
      {id: 2, text: "Can person pay X in Y months?"},
      {id: 3, text: "Does person earn more than X?"}
    ]

  //   this.myForm = fb.group({
  //     // fineAmount: this.fineAmount,
  //     bsn: this.bsn
  //     // transactionId: this.transactionId,
  //     // timestamp: this.timestamp
  //   });
  };

  ngOnInit(): void {
    this.selectedType = this.queryTypes[0];
    // this.loadAll();
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.servicecjibGetPersonInfo.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(transaction => {
        tempList.push(transaction);
      });
      this.allTransactions = tempList;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the transaction field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the transaction updateDialog.
   * @param {String} name - the name of the transaction field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified transaction field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addTransaction(form: any): Promise<any> {
    this.Transaction = {
      $class: 'org.example.cjibnetwork.cjibGetPersonInfo',
      'fineAmount': Number(this.money),
      'bsn': this.bsn
      // 'transactionId': this.transactionId.value,
      // 'timestamp': this.timestamp.value
    };

    // this.myForm.setValue({
    //   'fineAmount': null,
    //   'bsn': null,
    //   'transactionId': null,
    //   'timestamp': null
    // });

    return this.servicecjibGetPersonInfo.addTransaction(this.Transaction)
    .toPromise()
    .then(response => {
      console.log(response);
      this.errorMessage = null;
      // this.myForm.setValue({
      //   'fineAmount': null,
      //   'bsn': null,
      //   'transactionId': null,
      //   'timestamp': null
      // });
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
        this.errorMessage = error;
      }
    });
  }

  updateTransaction(form: any): Promise<any> {
    this.Transaction = {
      $class: 'org.example.cjibnetwork.cjibGetPersonInfo',
      // 'fineAmount': this.fineAmount.value,
      // 'bsn': this.bsn.value,
      // 'timestamp': this.timestamp.value
    };

    return this.servicecjibGetPersonInfo.updateTransaction(form.get('transactionId').value, this.Transaction)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
      this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  deleteTransaction(): Promise<any> {

    return this.servicecjibGetPersonInfo.deleteTransaction(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.servicecjibGetPersonInfo.getTransaction(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'fineAmount': null,
        'bsn': null,
        'transactionId': null,
        'timestamp': null
      };

      if (result.fineAmount) {
        formObject.fineAmount = result.fineAmount;
      } else {
        formObject.fineAmount = null;
      }

      if (result.bsn) {
        formObject.bsn = result.bsn;
      } else {
        formObject.bsn = null;
      }

      if (result.transactionId) {
        formObject.transactionId = result.transactionId;
      } else {
        formObject.transactionId = null;
      }

      if (result.timestamp) {
        formObject.timestamp = result.timestamp;
      } else {
        formObject.timestamp = null;
      }

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
      this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  resetForm(): void {
    this.myForm.setValue({
      'fineAmount': null,
      'bsn': null,
      'transactionId': null,
      'timestamp': null
    });
  }
}
