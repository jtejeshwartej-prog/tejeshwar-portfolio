# Tejeshwar — Portfolio

A full React + TypeScript + Vite + Tailwind + Firebase portfolio application with a
Google-Sign-In-gated admin dashboard for managing every piece of content
(projects, gallery, videos, documents, presentations, 3D models, animations,
skills, achievements, resume, messages, and site settings).

---

## 1. Install

```bash
npm install
```

## 2. Configure Firebase (required before anything works)

The app renders and lets you browse the UI without Firebase configured, but
auth, content, and uploads stay empty/disabled until you do this:

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Create a project**.
2. In the project, go to **Build → Authentication → Sign-in method** → enable **Google**.
3. Go to **Build → Firestore Database → Create database** (start in production mode — the
   provided `firestore.rules` handles security).
4. Go to **Build → Storage → Get started** (also production mode — `storage.rules` is provided).
5. Go to **Project settings → General → Your apps → Add app → Web (`</>`)**.
   Copy the `firebaseConfig` values.
6. Copy `.env.example` to `.env` and fill in the values from step 5:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_ADMIN_EMAIL=jtejeshwartej@gmail.com
   ```

7. Deploy the security rules (this is what actually enforces admin-only writes —
   not just the UI):

   ```bash
   npm install -g firebase-tools   # once, if you don't have it
   firebase login
   firebase use --add               # pick the project you just created
   firebase deploy --only firestore:rules,storage:rules
   ```

8. Sign in once at `/admin` with **jtejeshwartej@gmail.com** via Google — this
   is the only account the rules and the app will ever treat as admin
   (see `ADMIN_EMAIL` in `.env` and the matching check in `firestore.rules` /
   `storage.rules`).

### If Firebase Storage asks for a billing plan
Firestore + Auth work entirely on the free Spark plan. Storage's free tier is
also usually enough for a portfolio, but if your project ever asks you to
upgrade to Blaze before Storage will activate: the rest of the app (auth,
Firestore-backed content, admin dashboard except file uploads) still works —
just leave media URLs blank until Storage is enabled, or upgrade later. Nothing
in the code needs to change.

## 3. Run locally

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## 4. Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview it locally with:

```bash
npm run preview
```

## 5. Deploy

**Firebase Hosting (recommended — `firebase.json` is already set up):**

```bash
npm run build
firebase deploy --only hosting,firestore:rules,storage:rules
```

**Any static host (Vercel, Netlify, Cloudflare Pages, etc.):**

- Build command: `npm run build`
- Output directory: `dist`
- Add the same environment variables from your `.env` in the host's dashboard
  (they must be prefixed `VITE_` to be picked up by Vite).
- Since this is a client-side-routed SPA, make sure the host rewrites all
  paths to `/index.html` (Vercel/Netlify do this automatically for Vite
  projects; `firebase.json` already includes the rewrite rule for Firebase
  Hosting).

## What you still need to do manually

- [ ] Create the Firebase project and enable Google Auth, Firestore, and Storage (steps above).
- [ ] Fill in `.env` with your Firebase web config.
- [ ] `firebase deploy --only firestore:rules,storage:rules` so the security
      rules are actually active (without this step, your Firestore/Storage
      defaults may block everything or allow too much, depending on the mode
      you created them in).
- [ ] Sign in once at `/admin` with `jtejeshwartej@gmail.com` and add your
      real content (home/about copy, projects, skills, resume, etc.) — the
      site ships with no seed content, by design, so you don't have to
      delete placeholder data later.
- [ ] Optional: point a custom domain at Firebase Hosting (or your chosen
      host) from that host's dashboard.
- [ ] Optional: replace `public/favicon.svg` and `public/og-image.png`
      (referenced in `index.html` but not included — add your own social
      preview image at that path) with your own branding.

## Project structure

```
src/
  lib/firebase.ts          Firebase app/auth/db/storage initialization
  hooks/                   useAuth, AuthContext, useToast
  services/
    firestore.ts           generic typed CRUD wrapper used by every collection
    storage.ts              upload service with per-folder type/size validation
    collections.ts          typed collection instances (projects, videos, ...)
    portfolio.ts             singleton docs: home content, about content, settings
  components/
    layout/                 navbar, footer, page transitions, protected route, backgrounds
    ui/                     magnetic buttons, tilt cards, scroll reveal
    three/                  HeroOrb (home hero) and ModelViewer (GLB/GLTF/OBJ)
    admin/                  shared admin building blocks (upload field, confirm dialog, atoms)
  pages/                    one file per public route
  pages/admin/              one file per admin route, all behind ProtectedRoute
firestore.rules             admin-email-only writes, public reads published content only
storage.rules                per-folder file-type/size validation, admin-only writes
```

## Security model (how the two layers fit together)

1. **Client-side** (`ProtectedRoute`, `useAuth`): purely a UX convenience —
   it shows a sign-in screen instead of the dashboard to anyone who isn't
   signed in as `jtejeshwartej@gmail.com`.
2. **Firestore/Storage rules** (the real enforcement): every write checks
   `request.auth.token.email == 'jtejeshwartej@gmail.com' && request.auth.token.email_verified == true`.
   Even if someone bypassed the UI entirely and called the Firestore/Storage
   SDK directly from the browser console, the rules reject the write.
   Public reads are limited to documents with `published: true` (except the
   `messages` collection, which the public can only *create* into, never
   read, list, update, or delete).
