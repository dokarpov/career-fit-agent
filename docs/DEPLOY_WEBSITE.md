# Publish the Career Fit website

The website code is already merged into `main` under `site/`. The application and browser tests passed. GitHub Pages is currently **disabled** for this repository; the latest deployment fails at `Configure Pages` with **Get Pages site failed: Not Found**.

## Activate once (repository owner)

1. Open **[Settings → Pages](https://github.com/dokarpov/rolehint/settings/pages)**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**, then save.
3. Open **[Publish Career Fit website](https://github.com/dokarpov/rolehint/actions/workflows/pages.yml)** → **Run workflow** → select **main** → **Run workflow**.
4. Check the workflow result. Both URLs must return HTTP 200 before announcing publication:
   - https://dokarpov.github.io/rolehint/site/
   - https://dokarpov.github.io/rolehint/site/workspace.html

The workflow uploads the contents of `site/` as the site's root, not the entire repository. The GitHub connection available to ChatGPT can edit and merge repository files, but cannot enable Pages in repository Settings. The Actions token cannot create the Pages site either.

**Troubleshooting:** If the deployment still fails after enabling GitHub Actions as the Pages source, inspect the latest [deployment job](https://github.com/dokarpov/rolehint/actions/workflows/pages.yml). A missing Pages site produces a `Configure Pages` 404; this is a repository setting issue rather than a missing `index.html`.
