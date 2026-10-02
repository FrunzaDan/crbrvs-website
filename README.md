# CRBRVS Website

The official website of the rapper CRBRVS (Cerga Andrei): a single-page music showcase with a custom audio player, a teaser video, a merch carousel and a contact form. It's prerendered and served as static files from Firebase Hosting.

---

## 🚀 Key Features

- **Custom music player:** An `<audio>`-based player with play/pause/stop, track switching, drag-to-seek on the progress bar, hold-to-scrub and keyboard seeking.
- **Music section:** Track list with artwork, an embedded YouTube playlist (privacy-enhanced `youtube-nocookie.com`) and a self-hosted teaser video.
- **Merch carousel:** T-shirts and other items with prices in RON, scroll buttons and a details modal.
- **Contact form:** Validated form that sends messages client-side through EmailJS.
- **SEO and sharing:** Per-page meta, Open Graph and Twitter tags plus canonical URLs, a web manifest and touch icons.
- **Analytics:** Firebase Analytics, loaded in a separate chunk after the app starts and skipped during server rendering.

---

## 🛠 Tech Stack

- **Frontend:** Angular 22.2 (standalone components, signals, zoneless), TypeScript, plain CSS with custom properties, a vendored subset of Bootstrap's grid/utility CSS, Bootstrap Icons
- **Backend:** N/A. Prerendering via `@angular/ssr`, with an Express server entry for running the SSR build
- **Database / Storage:** N/A. Songs and merch are static JSON files in `public/assets/`
- **Tooling & Other:** Firebase JS SDK (Analytics), EmailJS, Vitest + jsdom, Prettier, Firebase Hosting

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- Node.js `^22.22.3`, `^24.15.0` or `>=26` with npm
- Firebase CLI (`npm install -g firebase-tools`), only if you want to deploy

---

## ⚙️ Local Setup & Running

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

## 🔌 API / App Usage

There are two routes: `/` (the whole site) and `/404`. Any other URL redirects to `/404`.

To deploy (Firebase project `crbrvs-rap`, set in `.firebaserc`):

```bash
npm run build
firebase deploy
```

`firebase.json` serves `dist/crbrvs-website/browser` with clean URLs, security headers and long cache lifetimes for hashed bundles.

---

## 📝 License & Notes

Personal project built for the artist. No license file. The music, artwork, video and merch images belong to CRBRVS and aren't for reuse.
