import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './layout/layout.component';
import { ThemesComponent } from './themes/themes.component';

export const websiteChildrenRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent
    },
    {
        path: 'themes',
        component: ThemesComponent
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
