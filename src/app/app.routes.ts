import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/main-page/main-page.component').then(
        (m) => m.MainPageComponent,
      ),
    title: 'CRBRVS Rap Hive - Official Website of Rapper Cerga Andrei',
  },
  {
    path: '404',
    loadComponent: () =>
      import('./components/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent,
      ),
    title: '404',
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
