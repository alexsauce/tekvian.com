# AGENTS.md — Tekvian Solutions Website

> Read this file first. Read `docs/architecture.md` before making any structural changes.

## Project Overview
Static marketing website for Tekvian Solutions, LLC — a bilingual (EN/ES) IT services company in Nogales, AZ. Single-page site with two separate legal pages and a custom 404. Hosted on GitHub Pages at **tekvian.com**.

## Tech Stack
| Layer | Technology |
|---|---|
| Markup | HTML5 (no build step) |
| Styling | Tailwind CSS via Play CDN (`cdn.tailwindcss.com`) |
| Scripting | Vanilla JavaScript (`js/main.js`) |
| Fonts | Google Fonts — Inter (300–800) |
| Forms | Formspree (`https://formspree.io/f/mkodzveg`) |
| Analytics | Cloudflare Web Analytics |
| Hosting | GitHub Pages — repo `alexsauce/tekvian.com` |
| Domain | tekvian.com via Cloudflare DNS (grey cloud / DNS-only) |

## Project Structure
```
tekvian.com/
├── index.html          # Main single-page site (all sections)
├── agreement/
│   └── index.html      # Service Agreement — resolves as /agreement
├── privacy/
│   └── index.html      # Privacy Policy — resolves as /privacy
├── 404.html            # Branded error page
├── js/
│   └── main.js         # All runtime JS (theme, lang, nav, form, scroll)
├── images/             # Brand assets and optimized images
├── files/              # Downloadable assets (PDF agreement)
├── CNAME               # GitHub Pages custom domain
├── robots.txt          # Disallows /agreement and /privacy
└── sitemap.xml         # Homepage only (legal pages are noindex)
```

## Key Architecture Rules
1. **No build step.** Everything is plain HTML/CSS/JS. Do not introduce npm, bundlers, or compiled assets without migrating away from the Play CDN first.
2. **Tailwind via CDN.** All Tailwind config lives in the inline `<script>` block in each HTML file's `<head>`. Keep configs in sync across files.
3. **Clean URLs via folder/index.html.** `/agreement` and `/privacy` work because GitHub Pages serves `folder/index.html` for `/folder`. Never flatten these back to `.html` files.
4. **Dark mode is the default.** `<html class="scroll-smooth dark">` + `applyTheme(stored ? stored === 'dark' : true)`. Do not break this invariant.
5. **Bilingual via data attributes.** All user-visible strings use `data-en="…" data-es="…"`. Never hardcode text that should be translatable without adding both attributes.
6. **Image paths are relative in legal pages.** `agreement/` and `privacy/` use `../images/` (relative), not `/images/` (absolute), so they work on `file://` protocol locally.
7. **Review `docs/architecture.md` before any structural change** — especially adding pages, changing nav, modifying the form, or touching dark mode / language toggle logic.

## Build / Deploy
```bash
# No build step — push to master to deploy
git add <files>
git commit -m "description"
git push   # GitHub Pages auto-deploys on push to master
```

## Coding Conventions
- **No comments** unless the WHY is non-obvious.
- **No new JS files** without good reason — keep logic in `js/main.js`.
- **Tailwind utilities first**, custom CSS in the `<style>` block only when Tailwind can't do it.
- **Mobile-first** — use `sm:`, `lg:` prefixes for larger breakpoints.
- **Accessibility** — always include `aria-label` on icon-only buttons, use semantic HTML elements.
- New partner logos: use SimpleIcons CDN slug (`https://cdn.simpleicons.org/{slug}`) with `onerror` fallback span.

## Agent Instructions
1. **Before structural edits**: read `docs/architecture.md` to understand dependencies and invariants.
2. **After adding a page**: update `docs/architecture.md` container diagram and module catalog; update `sitemap.xml` if the page should be indexed.
3. **After changing a data flow** (form, analytics, dark mode, lang toggle): update the relevant flow diagram in `docs/architecture.md`.
4. **After adding a CDN dependency**: add it to the External Services table in `docs/architecture.md`.
5. **Keep `AGENTS.md` under 150 lines.** Move detail to `docs/architecture.md`.
