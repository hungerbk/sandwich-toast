# Ingredient assets

## Naming convention

One file per ingredient, `{ingredient}.webp`. No separate left/right files —
the pre-sliced split (issue #6) is done at render time with CSS `clip-path`
on the single image, not by shipping two cropped files.

## Current ingredients

| file | toast type | ingredient | size |
| --- | --- | --- | --- |
| `lettuce.webp` | success | lettuce | 556×562 |
| `tomato.webp` | error | tomato | 499×400 |
| `cheese.webp` | warning | cheese | 450×400 |
| `bread.webp` | info | bread | 800×200 |
| `scrambled.webp` | — (loading) | scrambled | 800×200 |

Each file is cropped tight to its drawn content (no padding/whitespace), so
sizes differ per ingredient — that's expected, not a bug. `Ingredient.tsx`
handles the two rendering modes:

- `bread` / `scrambled` render as a single full-width base/cap layer.
- `lettuce` / `tomato` / `cheese` are tiled 4x side by side, overlapping,
  each instance with a slightly different rotation (and a matching
  scale-down so the rotated corners don't visually spill past the tile's
  box) to build up the full sandwich width rather than stretching one image.

## Reserved (not part of the current ingredient type union)

- `ketchup.webp` (800×200) — same canvas as `scrambled.webp` so it lines up
  when layered directly on top of it. Kept as a separate file (rather than
  baked into `scrambled.webp`) so it can be animated independently as a
  loading indicator. Not wired up yet.
- `bacon` — mentioned in the original spec as a future-extensibility
  example; no asset yet, no type union entry yet.
