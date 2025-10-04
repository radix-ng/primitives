import { Route } from '@angular/router';
import { List } from './pages/list';

export const appRoutes: Route[] = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'list',
        component: List,
        children: [
            {
                path: 'avatar',
                loadComponent: () => import('./components/avatar/page')
            },
            {
                path: 'accordion',
                loadComponent: () => import('./components/accordion/page')
            },
            {
                path: 'collapsible',
                loadComponent: () => import('./components/collapsible/page')
            },
            {
                path: 'checkbox',
                loadComponent: () => import('./components/checkbox/page')
            },
            {
                path: 'label',
                loadComponent: () => import('./components/label/page')
            },
            {
                path: 'select',
                loadComponent: () => import('./components/select/page')
            },
            {
                path: 'separator',
                loadComponent: () => import('./components/separator/page')
            },
            {
                path: 'slider',
                loadComponent: () => import('./components/slider/page')
            },
            {
                path: 'switch',
                loadComponent: () => import('./components/switch/page')
            },
            {
                path: 'toggle-group',
                loadComponent: () => import('./components/toggle-group/page')
            },
            {
                path: 'tabs',
                loadComponent: () => import('./components/tabs/page')
            }
        ]
    }
];
