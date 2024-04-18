import { Route } from '@angular/router';
import { LayoutMarketingComponent } from './modules/marketing/layout.component';
import { EmptyLayoutComponent } from './layouts/empty.component';

export const appRoutes: Route[] = [
    { path: '', pathMatch: 'full', redirectTo: '' },

    {
        path: '',
        component: LayoutMarketingComponent,
        children: [{ path: '', loadChildren: () => import('./modules/marketing/routes') }]
    },

    {
        path: '',
        component: EmptyLayoutComponent,
        children: [
            {
                path: 'login',
                loadChildren: () => import('./modules/auth/login/routes')
            }
        ]
    }
];
