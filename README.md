# OPSC Priority Vacant Posts (web dashboard)

Static React + Vite dashboard (UN / institutional styling). Loads `public/data/ministries_pvp.csv`.

## Local

```bash
npm install
# refresh CSV from ../Ministries_PVP_Clean.xlsx (requires Python + pandas):
npm run build
npm run preview
```

Development: `npm run dev`

## Deploy on GitHub Pages

Requires the parent folder pushed as your Git repo (this app lives under `psc-pvp-dashboard/`).

1. Commit **`public/data/ministries_pvp.csv`** (or commit **`Ministries_PVP_Clean.xlsx`** at the repo root so CI can regenerate the CSV automatically).
2. **Repository → Settings → Pages** → **Build and deployment** → Source: **GitHub Actions**.
3. Push to **`main`** (or **`master`**). The workflow **GitHub Pages** builds `psc-pvp-dashboard` and publishes `dist`.

Your site URL will be **`https://<username>.github.io/<repository>/`**.  

The Actions workflow sets **`VITE_BASE`** to **`/<repository>/`** (or **`/`** for a **`yourname.github.io`** repository) so script and CSS URLs resolve correctly. Using only **`base: './'`** often causes a **blank page** on Pages: `./assets/…` can resolve to `https://<user>.github.io/assets/…` instead of `…/github.io/<repo>/assets/…` when the URL has no trailing slash. The console may still mention **`main.tsx`** because of source maps.

Browsers may still request **`/favicon.ico`** at the hostname root (harmless 404 on project sites). A small inline SVG favicon `<link rel="icon">` is included so the tab icon does not depend on that file.

### If the Git repo is only this folder (`psc-pvp-dashboard` is the root)

Edit `.github/workflows/github-pages.yml`: drop the `psc-pvp-dashboard/` prefix on paths, set `working-directory: .` on the build step, use `path: dist` for `upload-pages-artifact`, and set `cache-dependency-path: package-lock.json`.
