import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig)
  .then(startAnalytics)
  .catch((err) => console.error(err));

// Analytics isn't needed to render the page, so it loads in its own chunk once the app is running.
async function startAnalytics(): Promise<void> {
  const [{ getAnalytics, isSupported }, { firebaseApp }] = await Promise.all([
    import('firebase/analytics'),
    import('./app/firebase'),
  ]);
  if (await isSupported()) {
    getAnalytics(firebaseApp);
  }
}
