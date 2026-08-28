# boMUC e.V. — website

Public site of **boMUC e.V.**, the volunteer wind orchestra in Munich.
Plain HTML, CSS, and a little JavaScript. No runtime framework.

Preview locally:

```bash
npm run build
npm run serve
```

Quality checks (the same commands GitHub Actions run):

```bash
npm ci
npx playwright install chromium
npm run check
```

GitHub Pages deploys a filtered `_site/` folder. Original photographs,
`styleguide.html`, and Node tooling are not published. One workflow checks
pull requests and deploys successful `main` builds.

## Copyright

Source code is MIT. Texts, logo, photographs, and concert artwork are
© boMUC e.V., all rights reserved. See [LICENSE.md](LICENSE.md) and
[NOTICE.md](NOTICE.md).
