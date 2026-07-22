# Architecture Map — Tekvian Solutions Website

> **Living document.** Update this file whenever you add a page, change a data flow, add a dependency, or modify a core invariant. See the [Maintenance Process](#maintenance-process) section.

---

## System Context

```mermaid
C4Context
    title System Context — tekvian.com

    Person(visitor, "Website Visitor", "Prospective client, EN or ES speaker, desktop or mobile")

    System(site, "tekvian.com", "Static marketing site — services, about, contact, legal pages")

    System_Ext(formspree, "Formspree", "Email delivery for contact form submissions")
    System_Ext(ghpages, "GitHub Pages", "Static hosting, auto-deploys on git push")
    System_Ext(cloudflare, "Cloudflare DNS", "DNS-only (grey cloud) — no proxy")
    System_Ext(cfanalytics, "Cloudflare Analytics", "Privacy-friendly visitor tracking beacon")
    System_Ext(simpleicons, "SimpleIcons CDN", "SVG brand logos for partner marquee")
    System_Ext(googlefonts, "Google Fonts", "Inter typeface (300–800 weights)")
    System_Ext(googlemaps, "Google Maps Embed", "Location iframe in contact section")
    System_Ext(tailwindcdn, "Tailwind Play CDN", "CSS utility generation at runtime")

    Rel(visitor, site, "Browses", "HTTPS")
    Rel(site, formspree, "POST form data", "HTTPS / FormData")
    Rel(formspree, visitor, "Sends confirmation email")
    Rel(ghpages, site, "Serves files", "HTTPS")
    Rel(cloudflare, ghpages, "DNS A records", "DNS-only")
    Rel(site, cfanalytics, "Beacon ping", "JS module")
    Rel(site, simpleicons, "Loads logo SVGs", "HTTPS img src")
    Rel(site, googlefonts, "Loads Inter font", "HTTPS link")
    Rel(site, googlemaps, "Embeds map iframe", "HTTPS")
    Rel(site, tailwindcdn, "Loads CSS engine", "HTTPS script")
```

---

## Container / Page Map

```mermaid
C4Container
    title Pages and Shared Assets

    Container(index, "index.html", "HTML + Tailwind + JS", "Main single-page site. All marketing sections.")
    Container(agreement, "agreement/index.html", "HTML + Tailwind + JS", "Service Agreement. URL: /agreement. noindex.")
    Container(privacy, "privacy/index.html", "HTML + Tailwind + JS", "Privacy Policy. URL: /privacy. noindex.")
    Container(notfound, "404.html", "HTML + Tailwind", "Branded 404 page. noindex.")
    Container(mainjs, "js/main.js", "Vanilla JS", "All runtime logic — theme, lang, nav, form, animations.")
    ContainerDb(images, "images/", "Static assets", "Optimized JPGs, PNGs, OG image, logos.")
    ContainerDb(files, "files/", "Downloads", "Service Agreement PDF.")

    Rel(index, mainjs, "loads")
    Rel(agreement, mainjs, "does NOT load — has inline scripts only")
    Rel(privacy, mainjs, "does NOT load — has inline scripts only")
    Rel(index, images, "references")
    Rel(agreement, images, "references via ../images/")
    Rel(privacy, images, "references via ../images/")
    Rel(notfound, images, "references")
    Rel(agreement, files, "links to PDF")
```

---

## Sections in index.html

```mermaid
flowchart TD
    TopBar["Fixed Top Bar\n(phone · email · Remote Support)"]
    Nav["Fixed Navbar\n(logo · nav links · EN/ES · dark toggle · CTA)"]
    Hero["#home — Hero\n(headline · badge · CTAs · background image)"]
    Services["#services — Services\n(9 cards: M365, Azure, Managed IT, Dev, etc.)"]
    About["#about — About / Why Us\n(3 value pillars)"]
    Expertise["#expertise — Tech Stack\n(4 pillar grid: .NET, RMM, Cloud, Security)"]
    Industries["#industries — Solutions / Industries\n(produce, logistics, cross-border + proprietary software)"]
    Partners["Partners Marquee\n(animated logo strip with SimpleIcons)"]
    Contact["#contact — Contact\n(form · map · hours · address)"]
    Footer["Footer\n(links · legal · copyright year)"]
    ScrollBtn["Scroll-to-Top Button"]

    TopBar --> Nav --> Hero --> Services --> About --> Expertise --> Industries --> Partners --> Contact --> Footer
    ScrollBtn -. "appears at 400px scroll" .-> Footer
```

---

## Data Flows

### Dark Mode
```mermaid
sequenceDiagram
    participant HTML as html[class]
    participant LS as localStorage
    participant JS as main.js

    Note over HTML: Page loads with class="dark" (default)
    JS->>LS: read 'theme'
    alt stored value exists
        JS->>HTML: applyTheme(stored === 'dark')
    else no stored value
        JS->>HTML: applyTheme(true) — default dark
    end
    Note over JS: User clicks toggle
    JS->>HTML: toggle 'dark' class
    JS->>LS: write 'theme'
```

### Language Toggle
```mermaid
sequenceDiagram
    participant LS as localStorage
    participant JS as main.js
    participant DOM as DOM elements

    JS->>LS: read 'lang' (default: 'en')
    JS->>DOM: querySelectorAll('[data-en]')
    JS->>DOM: el.innerHTML = el.getAttribute('data-' + lang)
    JS->>DOM: update document.documentElement.lang
    Note over DOM: All [data-en]/[data-es] elements updated
```

### Contact Form Submission
```mermaid
sequenceDiagram
    participant User
    participant Form as contact-form
    participant JS as main.js
    participant FS as Formspree

    User->>Form: fills fields + submits
    Form->>JS: submit event (preventDefault)
    JS->>JS: validate name, email, message
    alt validation fails
        JS->>Form: show inline error, highlight field
    else validation passes
        JS->>Form: disable button, show spinner
        JS->>FS: POST FormData to /f/mkodzveg
        alt Formspree OK
            FS-->>JS: 200 response
            JS->>Form: reset, show success message (bilingual)
        else Formspree error
            FS-->>JS: non-200
            JS->>Form: show error message (bilingual)
        end
        JS->>Form: restore button label (bilingual)
    end
```

---

## Module / Component Catalog

### `js/main.js`
| Function | Responsibility | Key Invariant |
|---|---|---|
| `applyTheme(dark)` | Adds/removes `dark` from `<html>`, swaps sun/moon icons | Must always keep icon state in sync with class |
| `toggleTheme()` | Reads current state, flips, persists to localStorage | Persists as `'dark'` or `'light'` string |
| `initTheme()` (IIFE) | Runs on load — defaults to dark if no stored value | Default is **dark**, not light |
| `setLang(lang)` | Replaces innerHTML of all `[data-en]` elements, updates `<html lang>` | Uses `innerHTML` — safe only for trusted content |
| `initLang()` (IIFE) | Reads localStorage `'lang'`, calls `setLang` | Default is `'en'` |
| `toggleMobileMenu()` | Animates mobile menu via `maxHeight` + `opacity` | No CSS transitions — JS-driven |
| `closeMobileMenu()` | Collapses menu, resets icons and aria state | Called on outside click |
| Scroll listener | Adds `shadow-md` to navbar at 20px; shows scroll-top btn at 400px | Passive listener |
| `IntersectionObserver` | Adds `.visible` to `.animate-on-scroll` elements; staggers siblings by 80ms | One-shot (unobserve after trigger) |
| Form submit handler | Validates → POST to Formspree → bilingual feedback | Reads `form.action` for endpoint URL |
| Smooth scroll polyfill | `scrollIntoView` on `a[href^="#"]` clicks | Polyfill for older Safari |
| Footer year | Sets `#year` text to current year | — |

### HTML Pages
| File | URL | Indexed | Tailwind Config | JS |
|---|---|---|---|---|
| `index.html` | `/` | ✅ yes | Inline, full config | `js/main.js` |
| `agreement/index.html` | `/agreement` | ❌ noindex | Inline, full config | Inline only (TOC observer) |
| `privacy/index.html` | `/privacy` | ❌ noindex | Inline, full config | Inline only (TOC observer) |
| `404.html` | `/*` (catch-all) | ❌ noindex | Inline, partial | Inline only (year) |

### External Services
| Service | Purpose | Token / ID | Fallback |
|---|---|---|---|
| Formspree | Contact form email | `mkodzveg` | Error message shown to user |
| Cloudflare Analytics | Visitor tracking | `3ae66682cd3d4076a9004d1d80651326` | Silent failure |
| SimpleIcons CDN | Partner logo SVGs | n/a (slug in URL) | `onerror` shows text span |
| Google Fonts | Inter typeface | n/a | System font fallback in config |
| Google Maps | Contact section map | n/a (embed URL) | Visible if iframe blocked |
| Tailwind Play CDN | CSS utilities | n/a | Site unstyled without it |

---

## SEO & Crawl Rules
- **Indexed:** `/` only
- **Excluded from crawl:** `/agreement`, `/privacy` (robots.txt + `noindex` meta)
- **Sitemap:** `https://tekvian.com/sitemap.xml` — homepage only
- **Structured data:** `LocalBusiness` JSON-LD in `index.html`
- **OG image:** `https://tekvian.com/images/og-image.png` (1200×630)

---

## Critical Invariants (Do Not Break)
1. `<html class="scroll-smooth dark">` — dark class must be on `<html>` at parse time to prevent flash.
2. All `[data-en]` elements must also have `[data-es]` — `setLang` sets `innerHTML`, a missing attribute silently empties the element.
3. `agreement/` and `privacy/` image paths use `../images/` (relative) — changing to `/images/` breaks local `file://` preview.
4. The contact form `action` attribute is the live Formspree endpoint — do not remove or test submissions will go to production.
5. Partner logo `<img>` tags must all have `onerror` handlers — CDN failures are silent otherwise.
6. Tailwind config blocks must be kept in sync across all HTML files (brand color palette, darkMode: 'class').

---

## Maintenance Process

### When to update this file
| Change | What to update |
|---|---|
| Add a new page | Container diagram, Sections diagram (if on index), Module catalog |
| Add/remove a nav link | Sections diagram |
| Add an external service | External Services table, System Context diagram |
| Change form endpoint | Contact Form flow diagram, External Services table |
| Add a new JS function | Module catalog |
| Change dark mode or lang logic | Relevant sequence diagram + Invariants |
| Add a new image or asset type | Module catalog (images row) |

### How to update
1. Edit the relevant Mermaid block directly — diagrams are source-of-truth.
2. Update `architecture.yaml` if structural (new page, new service, new invariant).
3. Commit alongside the code change in the same PR/commit.
