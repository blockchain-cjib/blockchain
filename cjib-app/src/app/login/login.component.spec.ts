import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { AuthService } from '../_services/auth.service';
import { HttpClientModule }    from '@angular/common/http';

import { LoginComponent } from './login.component';
import { QueryCitizenComponent } from '../query-citizen/query-citizen.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
         AppRoutingModule,
         FormsModule,
         ReactiveFormsModule,
         HttpClientModule
      ],
      declarations: [ 
        LoginComponent,
        QueryCitizenComponent
      ],
      providers: [
        AuthService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
