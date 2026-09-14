# sandwich-toast

🥪 A playful React toast library where notifications stack up as sandwich ingredient layers.

> Full usage docs land once the API is implemented — see the project issues for progress.

## Development

```bash
npm install
npm run dev         # demo playground (src/demo)
npm run build        # build the publishable library (src/lib -> dist)
npm run build:demo   # build the static demo site (src/demo -> dist-demo)
npm run typecheck
npm run lint
```

## Project structure

```
src/
├── demo/   # playground & demo site (not published)
└── lib/    # library source (published to npm)
```

## Toast duration

`duration` is measured in milliseconds. It defaults to `4000`, or `Infinity` for loading toasts.

- Values from `0` to `2147483647` are accepted. `0` schedules dismissal without a waiting period; the dismissal animation still runs.
- `Infinity` disables automatic dismissal.
- Negative values, `NaN`, and values above the maximum (except `Infinity`) fall back to the toast type’s default duration.
- Ingredient methods use the final `type` to determine the default when the type is overridden.
