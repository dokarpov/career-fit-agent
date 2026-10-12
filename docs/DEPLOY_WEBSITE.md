# RoleHint site — current publishing arrangement

GitHub Pages is enabled for the public repository [dokarpov/rolehint](https://github.com/dokarpov/rolehint).

**Publishing source:** `Deploy from a branch` on `main` (repository root). This makes two distinct paths available:

- [Interactive production web app](https://dokarpov.github.io/rolehint/) — the root `index.html`, wired to existing runtime.
- [Public RoleHint website](https://dokarpov.github.io/rolehint/site/) — editorial marketing site from `site/index.html`.
- [Interactive prototype](https://dokarpov.github.io/rolehint/site/workspace.html) — fictional role data, no actual submissions.

With branch publishing enabled, **do not run** the manual `Publish RoleHint website (manual Pages source)` workflow: it is for an optional future switch to `GitHub Actions` as the publishing source. It deliberately does not auto-run so an Actions deployment cannot overwrite the branch-published site.

If the publishing source is changed to GitHub Actions later, update canonical paths and `site/product.json`, `site/llms.txt`, `site/robots.txt`, `site/sitemap.xml` before switching, because that workflow publishes the `site/` content directly at `https://dokarpov.github.io/rolehint/`.

QA: check both the public site and prototype return HTTP 200, and confirm that GitHub Actions **test** / browser smoke jobs succeed.
