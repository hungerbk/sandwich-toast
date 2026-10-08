# Ingredient assets

[한국어](README.md) | English

## Naming convention

One file per ingredient, `{ingredient}.webp`. The current implementation
uses overlapping tiles and silhouette clipping. The pre-sliced layout
is tracked separately in issue #6.

## Current ingredients

| file | toast type | ingredient | size |
| --- | --- | --- | --- |
| `lettuce.webp` | success | lettuce | 556×562 |
| `tomato.webp` | error | tomato | 499×400 |
| `cheese.webp` | warning | cheese | 450×400 |
| `bread.webp` | info | bread | 800×200 |
| `scrambled.webp` | loading | scrambled | 800×200 |

Each file is cropped tight to its drawn content (no padding/whitespace), so
sizes differ per ingredient — that's expected, not a bug. `Ingredient.tsx`
handles the two rendering modes:

- `bread` / `scrambled` render as a single full-width base/cap layer.
- `lettuce` / `tomato` / `cheese` are tiled 4x side by side, overlapping,
  each instance with a slightly different rotation (and a matching
  scale-down so the rotated corners don't visually spill past the tile's
  box) to build up the full sandwich width rather than stretching one image.

## Loading overlay (`ketchup.webp`)

`ketchup.webp` (800×200) is the same canvas size as
`scrambled.webp` (issue #12) so it lines up when layered directly on top of
it — but it's not exclusive to `scrambled`. `Ingredient` overlays it on top
of *whichever* ingredient is showing whenever `isLoading` is true (see
`toast.loading()`), looping a clip-path "squeeze on, hold, wipe off"
animation. It was kept as a separate file rather than baked into
`scrambled.webp` specifically so it could be animated independently and
reused across ingredients.

Set `ketchup: true` to show a static overlay on non-loading toasts.
Loading toasts show the overlay regardless of this option; reduced-motion settings disable its animation.

## Compression and bundle measurements (#40)

The retained approach embeds all six WebP assets in the library JavaScript.
Five ingredient images were re-encoded with Sharp using WebP `quality: 80`,
`alphaQuality: 100`, and `effort: 6`, without resizing. Decoded alpha channels
were identical to the originals. Ketchup remains unchanged: re-encoding it
increased its size from 19,346 to 21,962 bytes.

Use the originals from commit `3662e73` for future compression comparisons;
do not repeatedly recompress the already lossy optimized files.

### Recorded results

Before → after, in bytes:

- Bread: 67,692 → 8,366
- Cheese: 58,666 → 8,600
- Lettuce: 101,322 → 18,648
- Scrambled egg: 67,970 → 13,550
- Tomato: 84,226 → 13,290
- Ketchup: 19,346 → 19,346
- Image total: 399,222 → 81,800 (79.5% reduction)
- ESM JavaScript: 556,149 → 132,917; gzip: 407,318 → 91,015
- CJS JavaScript: 552,081 → 128,849; gzip: 406,284 → 89,995

These are actual `npm run build` outputs, measured with Node v24.13.0 and
Vite v8.1.5. Gzip uses Node `zlib.gzipSync` defaults, not Vite's console estimate.
The ESM and CJS figures are alternatives, not a combined browser download.
Declarations, package archive size, React, and HTTP headers are excluded.

For a repeatable measurement, run `npm ci`, `npm run build`, then:

```sh
node --input-type=module <<'JS'
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const assets = 'src/lib/assets/';
const imageBytes = readdirSync(assets)
  .filter(name => name.endsWith('.webp'))
  .reduce((total, name) => total + statSync(assets + name).size, 0);
console.log('WebP total:', imageBytes);
for (const name of ['sandwich-toast.es.js', 'sandwich-toast.cjs']) {
  const file = readFileSync('dist/' + name);
  console.log(name, { bytes: file.length, gzip: gzipSync(file).length });
}
JS
```

### Visual comparison

Compared original-resolution quality 90 (107,124 bytes total),
original-resolution quality 80 (84,416 bytes including re-encoded ketchup),
and reduced-resolution quality 90 (89,672 bytes).
The reduced candidate capped tiled images at 400px wide and single layers
at 600px wide. The reviewer reported no noticeable difference between the
three candidates, and no significant discomfort in the actual toast after
applying quality 80. Retaining the smaller original ketchup yields 81,800 bytes.

The comparison page offered scale 0.5, 1, and 1.5, 1.12× hover enlargement,
and light/dark backgrounds. The actual display DPR was not recorded, so this
is not an exhaustive DPR or device quality guarantee. At scale 1.5 with hover
and DPR 2, a 320px-wide layer would need about 1,075 source pixels for 1:1
sampling; even the original 800px layers are below that. Resolution was
therefore retained rather than reduced further.

### External files and unused ingredients

An isolated prototype preserved relative WebP imports/requires and copied
images beside the library. A minimal Vite consumer built with
`base: '/sandwich-test/'` produced these totals:

- Current inline ESM: JavaScript gzip 148,841 bytes.
- External ESM: JavaScript gzip 65,208 + images 81,800 = 147,008 bytes.
- External CJS: JavaScript gzip 66,016 + images 81,800 = 147,816 bytes.

These totals include the consumer's React code and assume all six image files
are transferred without additional compression. They exclude request overhead
and cache effects; actual first-view transfers can differ. Generated image
references matched all six output files under the configured base path.
The CJS consumer explicitly included the prototype directory in Vite's
CommonJS processing because it was outside `node_modules`.

Direct Node loading of the external prototype failed for WebP imports in ESM
and WebP requires in CJS. This does not rule out other external-asset designs,
but this design needs consumer asset/SSR integration. Browser requests and
installed-package compatibility of that prototype were not verified.

External files could be cached independently with suitable HTTP cache headers
and stable content hashes. Given the modest total-size difference and added
integration requirements, externalization is deferred and inline assets remain.

Calling only `toast.success()` still included all six images: `Toaster` selects
from a runtime ingredient map and supports loading/ketchup options. Removing
unused ingredients requires a separate registration, entry-point, or loading
design. Selective ingredients are deferred to preserve the current simple API.

### Size budgets

Initial review thresholds for the current feature set (decimal bytes):

- Six WebP assets combined: **90,000 bytes**.
- ESM JavaScript: **145,000 bytes**, gzip **100,000 bytes**.
- CJS JavaScript: **140,000 bytes**, gzip **100,000 bytes**.

These rounded thresholds leave roughly 9–11% headroom above the measured
results. They are regression review limits, not additional compression targets.
If exceeded, inspect the cause and visual quality before changing the budget;
do not reduce quality solely to pass it. Measure with the same lockfile and
Node version when comparing results. `npm run check` builds the library and
checks these budgets; CI runs the same command.

Passing these budgets does not guarantee a small footprint or fast loading in
every consuming app. Inlining all six images adds transfer cost compared with
text notifications without images. For this release, we accept that cost to
preserve the sandwich visuals and simple API, and use these budgets as release
thresholds. If real consuming apps show a loading burden, revisit external
image caching or selective ingredients in a future version. ESM and CJS are
alternative formats, so their budgets are not added together. Actual transfer
size depends on the consuming app's bundling, compression, and caching.
