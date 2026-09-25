import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserInfoResolver } from './core/resolvers/user-info.resolver';
import { AuthGuard } from './core/guards/auth.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

const routes: Routes = [
  // Public page (no login). Must stay above the guarded '' route, which would otherwise match it.
  {
    path: 'release-log',
    loadComponent: () =>
      import('./modules/release-log/release-log.component').then(
        (m) => m.ReleaseLogComponent
      ),
  },
  {
    path: '',
    resolve: { userInfo: UserInfoResolver },
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./layout/layout.module').then((m) => m.LayoutModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  { path: '**', redirectTo: 'auth', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    bindToComponentInputs: true
})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
