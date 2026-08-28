# Agent notes for the boMUC site

Always-on guidance for edits. The live site is static HTML/CSS/vanilla JS.
Node exists only for lint, tests, and GitHub Actions.

## Purpose

Show a professional volunteer wind orchestra, sell concert attendance, and
invite players and sponsors. Keep copy short. Concerts are the primary CTA.

## Design system

- Tokens live in `css/tokens.css`. Components in `css/style.css` must use the
  semantic layer (`--bg`, `--text`, `--rule`, `--acc`, `--acc-ink`), not the
  grey ramp, unless a private styleguide demo needs a literal swatch.
- One accent: `#FFE700`. Yellow is a fill or a strong line, never small text
  on white.
- Radius is 0.
- Two angles: `--slant` between sections, `--angle-hatch` for texture.
- Three line weights: `--hair`, `--line`, `--bar`.
- Outfit 400/600, self-hosted as WOFF2. Do not load Google Fonts.

`styleguide.html` is internal. It must never enter `_site/`.

## HTML

- One-page home plus `impressum.html` and `404.html`.
- Menu labels match the section `.label` text.
- Every hero metadata row uses plain `boMUC e.V.` text on the left and
  page-specific context on the right; the brand is not a link there.
- Footer always links `impressum.html#impressum` and `impressum.html#datenschutz`.
- External links: `target="_blank" rel="noopener noreferrer"` plus a visually
  hidden “öffnet in neuem Tab” where a new tab is used.
- No cookies, analytics, embeds, or contact form.

## Images

Canonical files: `assets/images/_originals/`. Never deploy that folder.

Regenerate web files locally with `bash tools/optimize-images.sh`; CI only
validates the committed results. It must not move sources. Keep two derivatives
per photograph: 800px `*-thumb.webp` files for inline `img src`, and high-quality
`*.webp` files (up to 3200px) for lightbox `href`. Do not put lightbox files in
below-the-fold `srcset`s: they must load only after interaction. The logo needs
only `logo.webp`. Strip metadata on derivatives only.

Keep `width`/`height` accurate. Hero is eager; everything else is lazy.

## Legal

`impressum.html` is combined Impressum, Haftungshinweise, and Datenschutz.
Cite § 5 DDG, not TMG. Address, board, and VR 210477 are filled. There is
deliberately no telephone number: contact is email only, which § 5 DDG permits
(ECJ C-649/17). Do not add one back without a monitored line.

Do not invent register or tax data. This is drafting, not legal advice.

## Public artifact

`bash tools/build.sh` copies the public pages, `css/`, `js/`, and `assets/`
into `_site/`, then drops `assets/images/_originals`. It does not copy
`styleguide.html`, tools, or Node files. Add `.nojekyll` for GitHub Pages.

## Licensing

Source code is MIT under `LICENSE.md`. Text, logo, photographs, flyers, and
other orchestra media remain all rights reserved under `NOTICE.md`.

## Commands (also used in CI)

```bash
npm run lint
npm run build
npm test
npm run lighthouse
npm run check
```

`.github/workflows/pages.yml` runs `npm run check` for pull requests and main,
then deploys only successful main builds. Do not add a check that exists only
locally. Pin Action versions. No Dependabot.

## House style for future copy

German, concise, no photo credits, copyright line `© 2026 boMUC e.V.`.
Sharp corners, dark ground, Munich yellow.
