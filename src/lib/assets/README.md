# Ingredient assets

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
Loading toasts always animate the overlay, regardless of this option.
