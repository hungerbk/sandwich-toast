# Ingredient assets

## Naming convention

One file per ingredient, `{ingredient}.webp`. No separate left/right files —
the pre-sliced split (issue #6) is done at render time with CSS `clip-path`
on the single image, not by shipping two cropped files.

## Current ingredients

| file | toast type | ingredient |
| --- | --- | --- |
| `lettuce.webp` | success | lettuce |
| `tomato.webp` | error | tomato |
| `cheese.webp` | warning | cheese |
| `bread.webp` | info | bread |

All source canvases are 1600×400, but the drawn content is not centered and
does not fill the same proportion of the canvas across ingredients (`bread`
nearly fills its canvas; `lettuce`/`tomato`/`cheese` are smaller and sit at
different positions). This is intentional, not a cropping issue:

- `bread` renders as a single full-width base/cap layer.
- `lettuce` / `tomato` / `cheese` are meant to be tiled ~4x side by side
  (each instance with a slightly different rotation) to build up the full
  sandwich width, rather than stretching one image. Ingredient.tsx (issue
  #4) needs a repeat/tile rendering mode for these, separate from bread's
  single-image mode.

## Reserved (not part of the current ingredient type union)

- `ketchup.webp`, `scrambled.webp`, `no-ketchup-scrambled.webp` — art for
  the future loading-spinner feature (backlog: ketchup/mustard sauce map,
  scrambled-egg loading layer). Not wired up yet.
- `bacon` — mentioned in the original spec as a future-extensibility
  example; no asset yet, no type union entry yet.
