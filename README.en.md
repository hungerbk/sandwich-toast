# 🥪 sandwich-toast

<img width="1162" height="771" alt="sandwich-toast demo screenshot" src="https://github.com/user-attachments/assets/4a120279-3021-445f-8465-457e9d05c511" />

A React toast library that stacks notifications as sandwich ingredients, with a bite animation when they close.

[한국어](./README.md) · **English**

[Demo](https://hungerbk.github.io/sandwich-toast/)

## Features

- APIs based on notification status or sandwich ingredients
- Stacked toasts that move to the front and restart their timer when clicked
- Pause automatic dismissal on hover or keyboard focus
- Six positions and configurable scale
- Loading animation and ketchup topping
- TypeScript types, with no separate CSS import required

## Run locally

The npm package release is in preparation. For now, clone the repository to try the demo. The project uses React 19.

```bash
git clone https://github.com/hungerbk/sandwich-toast.git
cd sandwich-toast
npm ci
npm run dev
```

## Basic usage

Only one mounted `<Toaster />` per app is supported. Multiple components can call the same `toast` API. In development, a console warning is emitted when multiple Toasters are mounted. Duplicate rendering is not blocked, and using multiple instances simultaneously is unsupported.

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
toast.success("Saved!"); // Lettuce
toast.error("Please try again."); // Tomato
toast.warning("Please check."); // Cheese
toast.info("Fresh news!"); // Bread
toast.loading("Getting ready…"); // Scrambled egg
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

`scale` ranges from `0.5` to `1.5`. Finite positive values outside this range are clamped to the nearest bound (for example, `0.2` → `0.5`, `2` → `1.5`). Invalid values such as `0`, negative numbers, `NaN`, and `Infinity` fall back to `1`. Check readability and layout with your app’s font and viewport even within this range.

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
- Hover or keyboard focus pauses automatic dismissal. Once both end, the remaining time resumes. Clicking a toast restarts its full duration.

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

- Automatic dismissal and the close button play the dismissal animation before removal. With reduced motion enabled or Web Animations unavailable, removal is immediate.
- `toast.dismiss(id)` removes that toast after the dismissal animation. Removal is immediate when no Toaster is mounted, reduced motion is enabled, or Web Animations is unavailable.
- `toast.dismiss()` immediately removes all toasts, including loading toasts.
- `toast.dismiss(undefined)` or an unknown ID removes nothing.

There is no display limit or waiting queue. All active toasts are rendered. Toasts with `duration: Infinity` must be dismissed manually.

## Writing messages

Toasts are intended for short notifications. Messages display up to two lines, with overflowing text truncated by an ellipsis. Font size is inherited from `body`, so the amount of visible text depends on the font, font size, and scale.

Put the key result or required action first, and make details available elsewhere in your app. Expanding truncated messages visually is not currently supported.

## Accessibility

### Keyboard navigation

Use Tab/Shift+Tab to navigate message and close buttons. From either button, Up/Down moves to the previous/next card's message button in visual stack order. The direction is the same for top and bottom placement; reordering updates navigation order. Navigation stops at either end and skips dismissing cards.

Within a card, Right moves to the close button and Left moves to the message button. If that button already has focus, focus stays there; horizontal navigation never moves to another card.

Press Enter/Space on a message button to bring its toast to the front. Focus expands the card and pauses automatic dismissal. Arrow keys with modifiers are left untouched. If a screen reader uses arrow keys for its own navigation, it must pass the keys through to the page for this feature to work.

### Screen reader announcements

New toast messages request screen reader announcements without moving focus. `error` uses a high-priority `alert`; other types use a polite `status` to avoid interrupting current speech. Actual announcement timing and order depend on the browser and screen reader.

Removal and visual reordering do not add a new announcement. However, clicking a message button or moving focus to another card after dismissal may cause that card's content to be read.

Rapid consecutive announcements may be skipped or interrupted depending on the browser and screen reader. This behavior was observed with VoiceOver; improvements are tracked separately. Sequential reading of every message is not guaranteed.

### Reduced motion

The library respects `prefers-reduced-motion: reduce`. Ketchup remains static, and hover enlargement and position transitions are disabled. If reduced motion is enabled when dismissal starts, the toast is removed without the bite animation. Duration and pause behavior are unchanged.

## Advanced configuration

### Labels and language

`toastLabels` provides Korean (`ko`) and English (`en`) presets. Korean is the default; language is not detected automatically. The import path below is relative to this repository's `src/demo` directory.

```tsx
import { Toaster, toastLabels } from "../lib";

<Toaster {...toastLabels.en} />;
```

A single preset sets both the close button label and the keyboard hint. The example above sets both to English. Use `<Toaster />` for the Korean defaults.

- `closeButtonLabel`: the close button's accessible name. The visible × remains unchanged.
- `reorderHint`: the hint shown when the message button has keyboard focus, also used as its screen reader description.

Override either prop to customize the wording. Use non-empty labels in your app's language. Toast messages use the text supplied to the `toast` call without translation.

For other languages, add a label object in your app and pass it to `Toaster`; no library source changes are needed. You can keep custom languages alongside the built-in presets.

```tsx
const appToastLabels = {
  ...toastLabels,
  ja: {
    closeButtonLabel: "閉じる",
    reorderHint: "Enter/Space キーで最前面に移動",
  },
};

<Toaster {...appToastLabels.ja} />;
```

### Portal and style inheritance

After mounting in the browser, `<Toaster />` renders through a Portal into `document.body`. No Provider or Portal container configuration is required. Server rendering and the initial client render produce no toast DOM.

Toasts escape the `transform`, `overflow`, and stacking context of their JSX wrapper. Fonts, font sizes, and inheritable CSS custom properties follow the actual DOM parent, `body`. Define shared fonts and theme variables on `html` or `body`. Styles and theme classes scoped to `#root` or another container do not automatically carry over. Styles on `html` and `body` themselves can still affect toasts.

React context and event propagation still follow the React tree. Toast clicks can reach ancestor click handlers, so placing `<Toaster />` at the top level of the app remains recommended. [React Portal documentation](https://react.dev/reference/react-dom/createPortal)

Ordering relative to ordinary layers follows CSS stacking contexts and `z-index`. A native `<dialog>` opened with `showModal()` occupies the browser's top layer and makes the rest of the document inert. Displaying or interacting with body-level toasts above that modal is unsupported; show essential feedback inside the modal instead. Other modal libraries may also restrict toast interaction through focus traps or by making outside content inert. [MDN showModal documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)

### Content Security Policy (CSP)

For strict CSP, pass a server-generated, per-response nonce from the first mount:

```tsx
<Toaster nonce={nonce} />
```

Allow the same nonce in CSP using `style-src 'nonce-…'`. If `style-src-elem` is specified separately, allow the nonce there too.

Your app generates and supplies the nonce; the library does not. Use a new cryptographically secure random value for each response, never a fixed value. Styles are inserted once, so keep the same nonce throughout the document from the first mount. Changing it later or recovering from an initially missing nonce is unsupported.

Inline WebP images require `data:` in `img-src`. Limit that allowance to the image directive. Styles do not require `unsafe-inline`.

In the environment checked, scale changes, positioning, hover, and dismissal worked with `style-src-attr 'none'`. Verify your target browsers and actual CSP policy too. [MDN: style-src-attr](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr)

### SSR and React Server Components

In regular React SSR, no toast DOM is emitted on the server or the first hydration render; toasts appear after browser mounting. Server creation calls return an empty string (`""`) without storing state, and `toast.dismiss()` does nothing. Server notifications are not restored in the browser. Create notifications in client event handlers or effects.

The package entry currently provides neither a `'use client'` directive nor a separate
`react-server` entry. In RSC environments such as Next.js App Router, import the package
inside a consumer-owned Client Component. Direct package imports to render Toaster or
call `toast` from a Server Component are unsupported. The no-op server API behavior in
regular SSR does not make direct RSC imports supported.

The following boundary example assumes the package is installed, unlike the repository demo's relative imports.

```tsx
// app/toast-client.tsx
"use client";

import { Toaster } from "sandwich-toast";

export default function ToastClient() {
  return <Toaster />;
}
```

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import ToastClient from "./toast-client";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastClient />
      </body>
    </html>
  );
}
```

The whole layout need not become a Client Component. Buttons that use `toast` should
also import it inside a Client Component and call it from event handlers.
To announce a Server Action result, call `toast` after receiving the result on the client.
Do not call it during rendering.

Regular React `renderToString`, `hydrateRoot`, and browser style application have been verified.
This RSC example follows [Next.js guidance on Client Component boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components);
actual Next.js App Router builds and execution have not yet been verified.

## Development

```bash
npm run dev    # Demo development server
npm run check  # Formatting, lint, types, tests, builds, and size budgets
```

- [Development setup and formatting](./CONTRIBUTING.md#english)
- [Tests and manual QA scope (Korean)](./tests/README.md)
- [Image assets and size budgets](./src/lib/assets/README.en.md)

Release preparation and follow-up improvements are tracked in [issues](https://github.com/hungerbk/sandwich-toast/issues).
