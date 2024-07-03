import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './layout/layout.component';

export const websiteChildrenRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent
    }
];

const websiteRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: websiteChildrenRoutes
    }
];

export default websiteRoutes;
