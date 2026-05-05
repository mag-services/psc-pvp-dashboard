# OPSC Priority Vacant Posts (web dashboard)

Static React + Vite dashboard (UN / institutional styling). Loads `public/data/ministries_pvp.csv`.

## Published dashboard (PSC PVP on GitHub)

- **Repo:** https://github.com/mag-services/psc-pvp-dashboard  
- **Site:** https://mag-services.github.io/psc-pvp-dashboard/  

**Updating live data:** The site reads committed **`public/data/ministries_pvp.csv`**, not Excel. Edit **`Ministries_PVP_Clean.xlsx`** (sheet **`data`**), put the workbook at **repo root** next to **`package.json`** (or above the nested app folder if you use that layout—see `scripts/generate-data.py`), run **`npm run generate-data`**, then commit **`public/data/ministries_pvp.csv`** and push to **`main`**. Wait for **GitHub Actions** (Pages); hard-refresh the live URL.

In-app instructions: sidebar **Update guide**, or **`public/docs/user-guide.html`**.

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

Use the workflow in **`.github/workflows/github-pages.yml`** in this directory (builds at repo root and uploads **`dist`**). **Settings → Pages** must use **GitHub Actions**, not “Deploy from a branch.”

**If the console shows `GET …/src/main.tsx` 404:** Pages is publishing **source** `index.html` (development entry) instead of the **built** `dist/`. Fix: switch Pages to **GitHub Actions** as above, push a successful workflow run, then hard-refresh.

### Monorepo (repo root is the parent of `psc-pvp-dashboard/`)

Use the separate workflow that sets `working-directory: psc-pvp-dashboard` and uploads `psc-pvp-dashboard/dist` (your parent `.github` folder, not the workflow inside this folder).
