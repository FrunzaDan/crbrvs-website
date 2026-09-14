# CRBRVS Website

Marketing site for the rap artist CRBRVS — music showcase with a custom audio player, a merch list, and a contact form. Server-rendered and deployed as an SSR/prerender hybrid on Firebase Hosting.

## Tech Stack & Architecture

- **Framework:** Angular 21, standalone components throughout, zoneless change detection (`provideZonelessChangeDetection()`), Signals for all component state
- **UI & Styling:** Plain CSS with a custom-property design system ([styles.css](src/styles.css)), a locally vendored, trimmed copy of Bootstrap's grid/flexbox/card/form utility CSS ([bootstrap-essentials.css](src/bootstrap-essentials.css) — no Bootstrap JS, no `bootstrap` npm package) used for layout across most components, plus `bootstrap-icons` for iconography
- **State & Data:** Angular Signals (`signal`/`computed`) end to end — no NgRx, no RxJS in application code (RxJS is only a transitive Angular peer dep). Content (songs, merch) is static JSON in `public/assets/*.json`, loaded synchronously through thin injectable services
- **Rendering:** SSR + prerendering via `@angular/ssr`, served either by the Express entry in [src/server.ts](src/server.ts) or as prerendered static output
- **Backend-as-a-service:** Firebase (`@angular/fire`) for Analytics only, deployed via Firebase Hosting ([firebase.json](firebase.json)); the contact form sends mail client-side through EmailJS — there's no custom backend/API
- **Tooling:** Angular CLI / `@angular/build` (esbuild), Vitest + jsdom for unit tests via the `@angular/build:unit-test` builder, Prettier for formatting

It's a single routed feature, not a multi-module app: [app.routes.ts](src/app/app.routes.ts) lazy-loads two top-level standalone components (`MainPageComponent`, `PageNotFoundComponent`, with a `**` catch-all redirecting to `404`). `MainPageComponent` composes the page as a flat stack of standalone components (`app-navbar`, `app-music`, `app-merch`, `app-contact`, `app-footer`, `app-back-to-top`) and calls `SeoService` on init to set meta/OG/Twitter tags and the canonical URL. [app.config.ts](src/app/app.config.ts) wires up the router (view transitions, scroll restoration to top, anchor scrolling), client hydration with event replay, Firebase providers, and zoneless change detection — so every component is `OnPush` and re-renders off signal writes, not zone patches. `app.config.server.ts` merges in `provideServerRendering()` for the SSR/prerender build. There are no guards, interceptors, or resolvers — nothing in the route tree needs them.

## Project Structure

```text
src/
├── app/
│   ├── components/     # One folder per standalone component (flat, no feature grouping)
│   │   ├── main-page/       # Route-level component, composes the page below
│   │   ├── navbar/
│   │   ├── hamburger-button/
│   │   ├── music/            # Song list/showcase
│   │   ├── music-player/     # Custom <audio>-backed player (scrub, drag-to-seek, keyboard seek)
│   │   ├── merch/
│   │   ├── contact/          # EmailJS-backed contact form
│   │   ├── footer/
│   │   ├── back-to-top/
│   │   └── page-not-found/
│   ├── services/        # load-music, load-merch, send-email, seo, scroller — all providedIn: 'root'
│   ├── interfaces/       # Song, MerchItem, ContactMeForm
│   ├── app.config.ts     # Browser providers (router, hydration, Firebase, zoneless CD)
│   ├── app.config.server.ts
│   └── app.routes.ts
├── environments/
│   └── environment.ts    # Firebase + EmailJS config (see note below)
├── main.ts / main.server.ts / server.ts   # Browser, SSR and Express entry points
├── bootstrap-essentials.css   # Vendored Bootstrap grid/utility subset
└── styles.css             # Global design tokens + resets
public/
└── assets/                # Static images, fonts, video, and the music/merch JSON "content"
```

Every component and service has a co-located `*.spec.ts` — there's no separate `tests/` tree.

## Getting Started

```bash
npm install
npm start          # ng serve, http://localhost:4202
npm run build       # production build (SSR + prerender) into dist/crbrvs-website
npm run watch       # development build, rebuilds on file changes
npm test            # Vitest, watch mode
npx ng test --watch=false   # single run, e.g. for CI
```

To run the SSR build locally after `npm run build`:

```bash
node dist/crbrvs-website/server/server.mjs
```

## Environment & Setup

There's no `.env`/`.env.example` or Docker setup — all runtime config lives in [src/environments/environment.ts](src/environments/environment.ts) as a plain committed object (Firebase web config + EmailJS service/template/public key). These are client-exposed keys by design (Firebase web config isn't a secret; access is controlled via Firebase security rules / EmailJS's public-key model), so this is fine as-is. If a second environment (staging, etc.) is ever needed, this file is where `fileReplacements` would need to be wired into `angular.json` — there's no such wiring today, just the one environment file.

## Testing

Vitest (via `@angular/build:unit-test`) with jsdom, configured through `tsconfig.spec.json`. 10 spec files / 65 tests covering every service and component, including DOM-level interaction tests (real `.click()` calls, pointer events) for stateful components like `music-player`.

## Deployment

`firebase.json` points Firebase Hosting at `dist/crbrvs-website/browser` with a catch-all rewrite to `index.html`, so deploys are a standard `ng build` + `firebase deploy` — check `.firebaserc` for the target project (`crbrvs-rap`).
