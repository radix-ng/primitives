import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home') },
    { path: 'accordion', loadComponent: () => import('./pages/accordion') },
    { path: 'checkbox', loadComponent: () => import('./pages/checkbox') },
    { path: 'dialog', loadComponent: () => import('./pages/dialog') },
    { path: 'popover', loadComponent: () => import('./pages/popover') },
    { path: 'select', loadComponent: () => import('./pages/select') },
    { path: 'slider', loadComponent: () => import('./pages/slider') },
    { path: 'switch', loadComponent: () => import('./pages/switch') },
    { path: 'tabs', loadComponent: () => import('./pages/tabs') },
    { path: '**', redirectTo: '' }
];
