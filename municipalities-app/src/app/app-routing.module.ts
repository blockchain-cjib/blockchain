import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CitizenFormComponent } from './citizen-form/citizen-form.component'
import { LoginComponent } from './login/login.component'

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'citizenForm', component: CitizenFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
