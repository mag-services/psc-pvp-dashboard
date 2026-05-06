# OPSC Priority Vacant Posts (web dashboard)



Static React + Vite dashboard (UN / institutional styling). At runtime it **fetches and parses** **`public/data/ministries_pvp.xlsx`** in the browser (sheet tab **`data`** via [SheetJS](https://www.npmjs.com/package/xlsx)). No CSV is required.



## Published dashboard (PSC PVP on GitHub)



- **Repo:** https://github.com/mag-services/psc-pvp-dashboard  

- **Site:** https://mag-services.github.io/psc-pvp-dashboard/  



**Updating live data (typical workflow):** With **GitHub Desktop**, clone the repo, open **`public/data/ministries_pvp.xlsx`** (sheet **`data`**) from the cloned folder in Excel, save, then **Commit** and **Push** to **`main`**. Wait for **GitHub Pages** Actions, then hard-refresh the site.

Details: **`public/docs/user-guide.html`** (sidebar **Update guide**).



## Deploy on GitHub Pages



Requires the parent folder pushed as your Git repo (this app lives under `psc-pvp-dashboard/`).



1. Ensure **`public/data/ministries_pvp.xlsx`** is committed (so it is copied into **`dist/data/`** at build time).

2. **Repository → Settings → Pages** → **Build and deployment** → Source: **GitHub Actions**.

3. Push to **`main`** (or **`master`**). The workflow builds `psc-pvp-dashboard` and publishes **`dist`** only.



Your site URL will be **`https://<username>.github.io/<repository>/`**.  



Do **not** set Pages to “Deploy from branch” using the **project source** folder — that serves `index.html` with **`/src/main.tsx`** (404). Use **GitHub Actions**.



### If the Git repo is only this folder (`psc-pvp-dashboard` is the root)



Use **`.github/workflows/github-pages.yml`** in this directory.



### Monorepo (repo root is the parent of `psc-pvp-dashboard/`)



Use the parent **`.github/workflows/github-pages.yml`** that sets `working-directory: psc-pvp-dashboard` and uploads `psc-pvp-dashboard/dist`.

