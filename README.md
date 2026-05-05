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

The Actions workflow uploads **only `psc-pvp-dashboard/dist`**. Do **not** set Pages to “Deploy from branch” using the project **source** folder — that serves `index.html` with **`/src/main.tsx`**, which gives **404 / blank page** because TypeScript is never built on GitHub.

### If the Git repo is only this folder (`psc-pvp-dashboard` is the root)

Edit `.github/workflows/github-pages.yml`: drop the `psc-pvp-dashboard/` prefix on paths, set `working-directory: .` on the build step, use `path: dist` for `upload-pages-artifact`, and set `cache-dependency-path: package-lock.json`.
