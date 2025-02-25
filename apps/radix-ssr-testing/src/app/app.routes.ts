import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'avatar',
        loadComponent: () => import('./components/avatar/avatar.component')
    },
    {
        path: 'accordion',
        loadComponent: () => import('./components/accordion/accordion.component')
    },
    {
        path: 'collapsible',
        loadComponent: () => import('./components/collapsible/collapsible.component')
    },
    {
        path: 'checkbox',
        loadComponent: () => import('./components/checkbox/checkbox.component')
    },
    {
        path: 'select',
        loadComponent: () => import('./components/select/select.component')
    },
    {
        path: 'separator',
        loadComponent: () => import('./components/separator/separator.component')
    },
    {
        path: 'slider',
        loadComponent: () => import('./components/slider/slider.component')
    },
    {
        path: 'switch',
        loadComponent: () => import('./components/switch/switch.component')
    },
    {
        path: 'toggle-group',
        loadComponent: () => import('./components/toggle-group/toggle-group.component')
    },
    {
        path: 'tabs',
        loadComponent: () => import('./components/tabs/tabs.component')
    }
];
