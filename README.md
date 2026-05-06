# OPSC Priority Vacant Posts (web dashboard)

Static React + Vite dashboard (UN / institutional styling). At runtime it loads **`public/data/ministries_pvp.csv`**, which is normally **generated from Excel** (not read in the browser).

## Published dashboard (PSC PVP on GitHub)

- **Repo:** https://github.com/mag-services/psc-pvp-dashboard  
- **Site:** https://mag-services.github.io/psc-pvp-dashboard/  

**Updating live data:**

1. **`ministries_pvp.xlsx`** (preferred) or legacy **`Ministries_PVP_Clean.xlsx`**: worksheet **`data`**, same column headers as documented in **`public/docs/user-guide.html`**.
2. Locally: `npm run generate-data` writes **`public/data/ministries_pvp.csv`**, then commit that CSV (or commit the workbook so CI can regenerate it).
3. On **GitHub**, either replace **`public/data/ministries_pvp.csv`** or commit **`ministries_pvp.xlsx`** at repo root so Actions runs **`scripts/generate-data.py`** when the workflow enables that step.
4. Wait for **Actions** → GitHub Pages, then hard-refresh the live URL.

In-app instructions: sidebar **Update guide**, or **`public/docs/user-guide.html`**.

## Deploy on GitHub Pages

Requires the parent folder pushed as your Git repo (this app lives under `psc-pvp-dashboard/`).

1. Commit **`public/data/ministries_pvp.csv`** and/or **`ministries_pvp.xlsx`** (or legacy **`Ministries_PVP_Clean.xlsx`**) at the repo root so CI can regenerate CSV.
2. **Repository → Settings → Pages** → **Build and deployment** → Source: **GitHub Actions**.
3. Push to **`main`** (or **`master`**). The workflow **GitHub Pages** builds `psc-pvp-dashboard` and publishes `dist`.

Your site URL will be **`https://<username>.github.io/<repository>/`**.  

The Actions workflow uploads **only `psc-pvp-dashboard/dist`**. Do **not** set Pages to “Deploy from branch” using the project **source** folder — that serves `index.html` with **`/src/main.tsx`**, which gives **404 / blank page** because TypeScript is never built on GitHub.

### If the Git repo is only this folder (`psc-pvp-dashboard` is the root)

Use the workflow in **`.github/workflows/github-pages.yml`** in this directory (builds at repo root and uploads **`dist`**). **Settings → Pages** must use **GitHub Actions**, not “Deploy from a branch.”

**If the console shows `GET …/src/main.tsx` 404:** Pages is publishing **source** `index.html` (development entry) instead of the **built** `dist/`. Fix: switch Pages to **GitHub Actions** as above, push a successful workflow run, then hard-refresh.

### Monorepo (repo root is the parent of `psc-pvp-dashboard/`)

Use the separate workflow that sets `working-directory: psc-pvp-dashboard` and uploads `psc-pvp-dashboard/dist` (your parent `.github` folder, not the workflow inside this folder).
