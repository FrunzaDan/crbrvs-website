import { RenderMode, ServerRoute } from '@angular/ssr';

/** Firebase Hosting serves only static files, so every page is prerendered at build time. */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
