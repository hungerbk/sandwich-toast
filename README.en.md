# 🥪 sandwich-toast

<img width="1162" height="771" alt="sandwich-toast demo screenshot" src="https://github.com/user-attachments/assets/4a120279-3021-445f-8465-457e9d05c511" />

A React toast library that stacks notifications as sandwich ingredients, with a bite animation when they close.

[한국어](./README.md) · **English**

[Demo](https://hungerbk.github.io/sandwich-toast/)

## Features

- APIs based on notification status or sandwich ingredients
- Stacked toasts that move to the front and restart their timer when clicked
- Pause automatic dismissal on hover
- Six positions and configurable scale
- Loading animation and ketchup topping
- TypeScript types, with no separate CSS import required

## Run locally

The npm package release is in preparation. For now, clone the repository to try the demo. The project uses React 19.

```bash
git clone https://github.com/hungerbk/sandwich-toast.git
cd sandwich-toast
npm install
npm run dev
```

## Basic usage

Place one `<Toaster />` at the top level of your app and call `toast` from event handlers. This example uses the import path for `src/demo` in this repository.

```tsx
import { toast, Toaster } from "../lib";

export default function App() {
  return (
    <>
      <Toaster position="top-center" scale={1} />
      <button type="button" onClick={() => toast.success("Saved!")}>
        Show toast
      </button>
    </>
  );
}
```

## Status and ingredient APIs

Status methods use a default ingredient.

```ts
toast.success("Saved!");           // Lettuce
toast.error("Please try again.");  // Tomato
toast.warning("Please check.");    // Cheese
toast.info("Fresh news!");         // Bread
toast.loading("Getting ready…");  // Scrambled egg
```

Choose an ingredient directly instead. Their default statuses are success, error, warning, info, and loading, respectively.

```ts
toast.lettuce("Something fresh!");
toast.tomato("Tomato has arrived.");
toast.cheese("Cheese added.");
toast.bread("Fresh from the oven.");
toast.scrambled("Preparing scrambled eggs…");
```

Status methods accept an `ingredient` override; ingredient methods accept a `type` override while keeping their ingredient.

```ts
toast.success("Done!", { ingredient: "tomato", duration: 6000 });
toast.bread("Getting ready…", { type: "loading" });
toast.cheese("With ketchup!", { ketchup: true });
```

## Position and scale

`position` defaults to `top-center`, and `scale` defaults to `1`.

- `top-left`, `top-center`, `top-right`
- `bottom-left`, `bottom-center`, `bottom-right`

```tsx
<Toaster position="bottom-right" scale={0.8} />
```

## Duration

`duration` is measured in milliseconds. The default is `4000`, or `Infinity` for loading toasts.

- Values from `0` to `2147483647` are accepted. `0` schedules dismissal without a waiting period; the dismissal animation still runs.
- `Infinity` disables automatic dismissal.
- Negative values, `NaN`, and values above the maximum (except `Infinity`) fall back to the final toast type’s default.
- Leaving a hovered toast resumes its remaining time. Clicking it restarts the full duration.

## Async work and dismissal

Creation methods return a toast ID. Loading toasts do not dismiss automatically by default, so dismiss them when the work finishes. Loading toasts with an explicit finite duration dismiss automatically.

```ts
async function saveWithToast(saveData: () => Promise<void>) {
  const id = toast.loading("Saving…");
  try {
    await saveData();
    toast.success("Saved!");
  } catch {
    toast.error("Could not save.");
  } finally {
    toast.dismiss(id);
  }
}
```

- Automatic dismissal and the close button play the bite animation before removal. If Web Animations is unavailable, removal is immediate.
- `toast.dismiss(id)` removes that toast immediately without an animation.
- `toast.dismiss()` immediately removes all toasts, including loading toasts.

There is no display limit or waiting queue. All active toasts are rendered. Toasts with `duration: Infinity` must be dismissed manually.

## Development

```bash
npm run dev         # Demo development server
npm run build       # Library build → dist
npm run build:demo  # Demo build → dist-demo
npm run typecheck
npm run lint
```

- `src/lib`: Library API, components, hooks, and ingredient images
- `src/demo`: Sandwich shop demo

Release preparation and follow-up improvements are tracked in [issues](https://github.com/hungerbk/sandwich-toast/issues).
