import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
        path: 'list',
        renderMode: RenderMode.Prerender
    },
    {
        path: '**',
        renderMode: RenderMode.Server
    }
];
