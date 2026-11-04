# ChartCortex, brand asset library

Generated from the 3D mark render. Regenerate any time with:

```
node brand/generate.mjs
```

The generator writes each asset as an SVG that places the shared mark
(`mark.png`, a 1200px transparent master) on a themed plate or beside the Chivo
900 wordmark. Headless Chrome renders the SVG at 2x (4x for the wide lockups),
then `sharp` trims and exports every size below.

## Folders

| Folder | Format | Notes |
| --- | --- | --- |
| `svg/` | SVG | Source files. They reference `../mark.png` and the bundled Chivo font, so keep the folder structure intact. |
| `png/` | PNG | Transparent background, except the store icons (`app-icon`, `app-maskable`), which are opaque as the stores require. |
| `jpg/` | JPEG | Flattened onto the brand navy `#070B10` (light variants onto `#F0F0F0`), for places that cannot take alpha. |
| `fonts/` | WOFF2 | Chivo 900, used by every wordmark. |
| `mark.png` | PNG | 1200px transparent mark master used by the SVG sources and the generator. |

## Variants

### Icon, mark on a plate (square)
`icon-dark`, `icon-light`

Sizes (px, square): `1024, 512, 256, 128, 64, 32, 16`

Rounded plate with the brand-gradient rim, mark centred at 55%. Use for
favicons, app switchers, and square avatars where a wordmark would not read.

### Social avatar (round)
`social-avatar`

Sizes (px, square): `1024, 512, 400, 320, 200`

Full-bleed circle with the rim, the mark and CHART/CORTEX. The corners are
transparent, so it drops straight onto X, LinkedIn, Instagram, YouTube or a
Discord server, and platforms that mask to a circle crop nothing.

### App icon (store submission)
`app-icon-1024`, `app-icon-512`, `app-icon-192`, `app-icon-180`, `app-icon-167`,
`app-icon-152`, `app-icon-120`

Full-bleed square, **opaque with no alpha**, no rounded corners: the App Store
and Play apply their own mask. Use `app-icon-1024.png` for the iOS listing and
`app-icon-512.png` for Google Play.

### Maskable icon (Android adaptive)
`app-maskable-512`

Opaque, full bleed, mark pulled inside the 80% safe zone so the launcher mask
never clips it.

### Launcher tile
`app-tile-1024`, `app-tile-512`, `app-tile-192`, `app-tile-180`

Rounded square with the rim, the mark and the wordmark. Transparent corners;
the rounded shape is part of the artwork.

### Horizontal lockup, mark + wordmark
`lockup-horizontal-dark`, `lockup-horizontal-light`

Widths (px): `2400, 1600, 1200, 800, 400`

Use for site headers, email signatures and document title bars.

### Stacked lockup, mark above wordmark
`lockup-stacked-dark`, `lockup-stacked-light`

Widths (px): `1024, 512, 256` (square)

Use for splash screens, stickers, merch and square placements.

### Wordmark only
`wordmark-dark`, `wordmark-light`

Widths (px): `1600, 800, 400`

One line: CHART in Galactic Violet, CORTEX in Bubblegum Pink.

### Colour palette sheet
`palette-dark`, `palette-light`

Widths (px): `2000, 1000`. Swatch sheets with every token, its hex and its role.

At the root of this folder:

- `palette.json`, every token plus the brand gradient.
- `palette.css`, the same tokens as custom properties (`--cc-*`), mirroring
  `src/app/globals.css`.

### Share cards
`og-1200` (1200x630) and `og-square-1200` (1200x1200), flattened artwork with a
real product screenshot. Refresh them whenever the terminal changes.

## Notes

- **Dark and light lockups share the same transparent artwork.** The wordmark
  colours are fixed by `brand.md`, so the variants differ only in the JPEG
  background they are flattened onto.
- **Mono icons are not supplied.** The mark is a 3D render with internal
  highlights, so a one-colour silhouette would need a dedicated flat redraw
  rather than a threshold of this artwork.
- **The mark is raster.** Every SVG references `mark.png`; do not move an SVG
  out of this folder without also copying the mark.
