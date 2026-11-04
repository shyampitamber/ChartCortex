# ChartCortex brand system

## The mark

Two brain hemispheres, navy on the left and pink on the right, split by a teal candle. The candle is vertically centred on the brain with equal overhang above and below, and stands taller than the hemispheres. The render is glossy and dimensional, so the mark is supplied as raster artwork at every size rather than as a flat vector.

The 1200px transparent master is `mark.png`. Every SVG in `svg/` references it and the bundled Chivo font, so the whole library can be rebuilt with `node brand/generate.mjs`.

## Colour

| Name | Hex | Use |
|---|---|---|
| Navy | `#070B10` | Page and app background |
| Panel | `#0D141C` | Cards, panels, raised surfaces |
| Galactic Violet | `#105BFF` | Wordmark "Chart", brand accents |
| Bubblegum Pink | `#F355D0` | Wordmark "Cortex", signal accents |
| Teal | `#81FFD9` | Primary buttons only, black text on teal |
| Off white | `#EAF2F0` | Text on navy |
| Muted | `#8FA3A6` | Secondary text on navy |

Green and red are reserved exclusively for price direction. Never use them for brand elements, buttons or highlights.

The supplied hex `#FE8500` renders orange and is not used. Bubblegum Pink is `#F355D0`.

## Typography

- **Wordmark:** Chivo, weight 900, uppercase, with CHART over CORTEX.
- **Headings, menu items and buttons:** Chivo, weight 600 to 900.
- **Body:** Comfortaa.
- **Display:** the rounded system display stack (`ui-rounded, "Segoe UI", system-ui, -apple-system, sans-serif`), weight 650 to 700, used for headings.
- Chivo 900 is shipped in `fonts/chivo-900.woff2`. Body text uses Comfortaa, loaded by the app.

## Logo usage

- **Clear space:** at least one quarter of the mark height on every side.
- **Minimum sizes:** mark 16px, horizontal lockup 120px wide, stacked lockup 96px.
- **Dark surfaces:** use the `-dark` variants or the transparent mark.
- **Light surfaces:** use the `-light` variants.
- Do not recolour, add effects, stretch, rotate, outline, or place the mark on busy imagery.
- Do not rebuild the lockup by hand. Use the supplied files so the spacing stays correct.

## Files

```
brand/
  mark.png  1200px transparent mark master used by every SVG
  png/      transparent exports (store icons are opaque, as required)
  jpg/      same artwork flattened onto the brand background
  svg/      self-contained layout sources (embed font and mark reference)
  fonts/    Chivo 900 webfont used by the wordmark
  generate.mjs  rebuilds the whole library
  palette.json / palette.css  colour tokens for developers
  README.md  full manifest with every size and use
```

Naming is `asset-variant-size.extension`, for example `lockup-horizontal-dark-1600.png`. Sizes are pixels along the long edge, except square assets which are width and height.

Asset families:

- `wordmark-dark` / `wordmark-light`
- `lockup-horizontal-dark` / `lockup-horizontal-light`
- `lockup-stacked-dark` / `lockup-stacked-light`
- `icon-dark` / `icon-light`
- `app-icon`, `app-tile`, `app-maskable`
- `social-avatar` (full circle, transparent corners)
- `og-1200`, `og-square-1200`
- `palette-dark`, `palette-light`

## Notes

- **Social avatars are circular.** `social-avatar` is a full-bleed circle with
  the rim, the mark and the wordmark, and transparent corners, so it works on
  every platform without further masking.
- **Store icons are opaque.** `app-icon` and `app-maskable` carry no alpha
  channel and no rounded corners; the stores apply their own mask.
- **Dark and light lockups share artwork.** The wordmark colours are fixed, so
  the variants differ only in the JPEG background they are flattened onto.
- Mono icons are not supplied. The mark is a 3D render with internal highlights, so a one-colour silhouette would require a dedicated flat redraw rather than a threshold of this artwork.
- The OG images use a real screenshot of the product. Refresh it whenever the terminal changes.
- Regenerate after any mark or wordmark change: `node brand/generate.mjs`.
