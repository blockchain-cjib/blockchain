import {Component, OnInit} from '@angular/core';
// import {ApiService} from '../api.service';
// import {CustomerService} from '../customer.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  login = function () {
    this.router.navigateByUrl('/citizenForm');
  };
}
