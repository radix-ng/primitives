import { Routes } from '@angular/router';
import { PricingComponent } from './pricing/pricing.component';
import { PageComponent } from './page.component';

export default [
    {
        path: '',
        component: PageComponent
    },
    {
        path: 'pricing',
        component: PricingComponent
    }
] as Routes;
