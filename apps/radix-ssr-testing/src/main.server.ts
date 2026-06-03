import { App } from './app/app';
import { config } from './app/app.config.server';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;
