# CRBRVS Website

CRBRVS Website is the official website of the rapper CRBRVS (Cerga Andrei). It's a single page that brings together the artist's music, a teaser video, merch and a way to get in touch. Its main feature is a custom audio player built on the HTML `<audio>` element, with scrubbing, drag-to-seek and keyboard controls. Songs and merch are stored as static JSON files, so updating the content doesn't need code changes. The site is prerendered with Angular SSR and served as static files from Firebase Hosting, with no backend of its own.

---

## Key Features

- **Custom music player:** Plays the track list with play, pause, stop, previous and next controls, and shows the artwork and elapsed time for the current song. You can drag the progress bar to seek, hold the skip buttons to scrub faster the longer you hold them, and seek with the keyboard.
- **Music section:** Lists the tracks with their artwork, embeds a YouTube playlist through the privacy-enhanced `youtube-nocookie.com` domain, and plays a self-hosted teaser video.
- **Merch carousel:** Shows T-shirts and other items with their prices in RON, with scroll buttons to move through the list. Each item opens a modal with a larger image and its description.
- **Contact form:** A validated form sends messages straight from the browser through EmailJS, so no server is needed. It shows clear success and failure messages.
- **SEO and sharing:** Sets the title, meta description, Open Graph and Twitter tags and a canonical URL. A web manifest and touch icons make the site look right when saved to a phone's home screen.
- **Analytics:** Firebase Analytics is loaded in a separate chunk after the app has started, so it doesn't slow the first render, and it's skipped during server rendering.

---

## Tech Stack

- **Frontend:** Angular 22.2 (standalone components, signals, zoneless), TypeScript, plain CSS with custom properties, a vendored subset of Bootstrap's grid/utility CSS, Bootstrap Icons
- **Backend:** N/A. Prerendering via `@angular/ssr`, with an Express server entry for running the SSR build
- **Database / Storage:** N/A. Songs and merch are static JSON files in `public/assets/`
- **Tooling & Other:** Firebase JS SDK (Analytics), EmailJS, Vitest + jsdom, Prettier, Firebase Hosting

---

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js `^22.22.3`, `^24.15.0` or `>=26` with npm
- Firebase CLI (`npm install -g firebase-tools`), only if you want to deploy

---

## Local Setup & Running

### 1. Clone the repository

```bash
git clone https://github.com/FrunzaDan/crbrvs-website.git
cd crbrvs-website
```

### 2. Configuration

All runtime config is in `src/environments/environment.ts`: the Firebase web config (used for Analytics) and the EmailJS service ID, template ID and public key. These are public client-side keys, so there's no `.env` file.

To change the content, edit `public/assets/music-list.json` (title, artwork, MP3 path) and `public/assets/merch-list.json` (title, price, description, image and its size).

### 3. Installation & Run

```bash
npm install
npm start          # dev server on http://localhost:4207
npm test           # Vitest unit tests
npm run build      # production build + prerender → dist/crbrvs-website
npm run serve:ssr:CRBRVS_Website   # run the built SSR server
```

`npm run build` also copies the prerendered `404/index.html` to `404.html`, so Firebase Hosting can serve it as the error page.

---

## API / App Usage

There are two routes: `/` (the whole site) and `/404`. Any other URL redirects to `/404`.

To deploy (Firebase project `crbrvs-rap`, set in `.firebaserc`):

```bash
npm run build
firebase deploy
```

`firebase.json` serves `dist/crbrvs-website/browser` with clean URLs, security headers and long cache lifetimes for hashed bundles.

---

## License & Notes

Personal project built for the artist. No license file. The music, artwork, video and merch images belong to CRBRVS and aren't for reuse.
