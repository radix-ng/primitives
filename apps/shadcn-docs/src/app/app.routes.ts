import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./pages/page.routes') },
    { path: 'docs', loadChildren: () => import('./docs/docs.component') }
];
