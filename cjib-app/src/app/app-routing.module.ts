import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QueryCitizenComponent } from './query-citizen/query-citizen.component'
import { LoginComponent } from './login/login.component'

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'queryCitizen', component: QueryCitizenComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
