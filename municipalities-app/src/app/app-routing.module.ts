import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CitizenFormComponent } from './citizen-form/citizen-form.component'
import { LoginComponent } from './login/login.component'
import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/citizenForm', pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'citizenForm', component: CitizenFormComponent, canActivate: [AuthGuard]  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
