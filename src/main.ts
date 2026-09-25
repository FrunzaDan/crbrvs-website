import { bootstrapApplication } from '@angular/platform-browser';
import { getAnalytics } from 'firebase/analytics';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { firebaseApp } from './app/firebase';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

if (typeof window !== 'undefined') {
  getAnalytics(firebaseApp);
}
