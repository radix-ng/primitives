import { bootstrapApplication } from '@angular/platform-browser';
import App from '@taxonomy/app.analog';
import 'zone.js';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
