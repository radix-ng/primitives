import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import App from '@taxonomy/app.analog';
import 'zone.js/node';
import { config } from './app/app.config.server';

if (import.meta.env.PROD) {
    enableProdMode();
}

const bootstrap = () => bootstrapApplication(App, config);

export default async function render(url: string, document: string) {
    const html = await renderApplication(bootstrap, {
        document,
        url
    });
    return html;
}
