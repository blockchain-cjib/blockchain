import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QueryCitizenComponent } from './query-citizen/query-citizen.component'
import { LoginComponent } from './login/login.component'
import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/queryCitizen', pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'queryCitizen', component: QueryCitizenComponent, canActivate: [AuthGuard] }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
