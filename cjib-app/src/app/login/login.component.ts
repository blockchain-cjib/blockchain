import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  errorAlert = false;
  returnUrl: string;
  error: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router) {
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.loginForm = this.formBuilder.group({
      name: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
        return;
    }
    this.login();
  }

  login = function () {
    var credentials = {
      name: this.f.name.value,
      password: this.f.password.value
    }
    this.authService.authenticate(credentials)
      .subscribe(
          res => this.loginSuccessCallback(res),
          err => this.loginFailCallback(err)
      );
  };

  loginSuccessCallback (result) {
    this.router.navigate([this.returnUrl]);
  }

  loginFailCallback(error) {
    this.errorAlert = true;
    this.error = error.error.msg;
  }
}
