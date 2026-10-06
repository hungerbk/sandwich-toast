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

Only one mounted `<Toaster />` per app is supported. Multiple components can call the same `toast` API. Each toast’s automatic dismissal timer is managed inside that Toaster. In development, a console warning is emitted when multiple Toasters from the same library module are mounted. Duplicate rendering is not blocked, and using multiple instances simultaneously is unsupported.

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

## Portal and style inheritance

On the server, toast creation methods return an empty string (`""`) without storing a notification or advancing the ID counter. `toast.dismiss()` also does nothing on the server. Server notifications are neither transferred to the browser nor shared across requests; create notifications in browser event handlers or effects.

After mounting in the browser, `<Toaster />` renders through a Portal into `document.body`. No Provider or Portal container configuration is required. Server rendering and the initial client render produce no toast DOM.

Toasts escape the `transform`, `overflow`, and stacking context of their JSX wrapper. Fonts, font sizes, and inheritable CSS custom properties follow the actual DOM parent, `body`. Define shared fonts and theme variables on `html` or `body`. Styles and theme classes scoped to `#root` or another container do not automatically carry over. Styles on `html` and `body` themselves can still affect toasts.

React context and event propagation still follow the React tree. Toast clicks can reach ancestor click handlers, so placing `<Toaster />` at the top level of the app remains recommended. [React Portal documentation](https://react.dev/reference/react-dom/createPortal)

Ordering relative to ordinary layers follows CSS stacking contexts and `z-index`. A native `<dialog>` opened with `showModal()` occupies the browser's top layer and makes the rest of the document inert. Displaying or interacting with body-level toasts above that modal is unsupported; show essential feedback inside the modal instead. Other modal libraries may also restrict toast interaction through focus traps or by making outside content inert. [MDN showModal documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)

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

## Writing messages

Toasts are intended for short notifications. Messages display up to two lines, with overflowing text truncated by an ellipsis. Font size is inherited from `body`, so the amount of visible text depends on the font, font size, and scale.

A Korean message checked in the demo displayed approximately 34 characters, including spaces and punctuation. For Korean notifications, aim for **around 30 characters** as a starting point and verify in your app. This is a guideline, not a character limit or a guaranteed fit; English and other languages have different visible lengths.

Put the key result or required action first, and make details available elsewhere in your app. Expanding truncated messages visually is not currently supported.

## Position and scale

`position` defaults to `top-center`, and `scale` defaults to `1`.

`scale` ranges from `0.5` to `1.5`. Finite positive values outside this range are clamped to the nearest bound (for example, `0.2` → `0.5`, `2` → `1.5`). Invalid values such as `0`, negative numbers, `NaN`, and `Infinity` fall back to `1`. Check readability and layout with your app’s font and viewport even within this range.

- `top-left`, `top-center`, `top-right`
- `bottom-left`, `bottom-center`, `bottom-right`

```tsx
<Toaster position="bottom-right" scale={0.8} />
```

## Labels and language

`toastLabels` provides Korean (`ko`) and English (`en`) presets. Korean is the default; language is not detected automatically. The import path below is relative to this repository's `src/demo` directory.

```tsx
import { Toaster, toastLabels } from '../lib';

<Toaster {...toastLabels.en} />
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
    closeButtonLabel: '閉じる',
    reorderHint: 'Enter/Space キーで最前面に移動',
  },
};

<Toaster {...appToastLabels.ja} />
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
- `toast.dismiss(id)` removes that toast after the bite animation. Removal is immediate when no Toaster is mounted or Web Animations is unavailable.
- `toast.dismiss()` immediately removes all toasts, including loading toasts.

There is no display limit or waiting queue. All active toasts are rendered. Toasts with `duration: Infinity` must be dismissed manually.

## Keyboard navigation

Use Tab/Shift+Tab to navigate message and close buttons. From either button, Up/Down moves to the previous/next card's message button in visual stack order. The direction is the same for top and bottom placement; reordering updates navigation order. Navigation stops at either end and skips dismissing cards.

Within a card, Right moves to the close button and Left moves to the message button. If that button already has focus, focus stays there; horizontal navigation never moves to another card.

Press Enter/Space on a message button to bring its toast to the front. Focus expands the card and pauses automatic dismissal. Arrow keys with modifiers are left untouched. If a screen reader uses arrow keys for its own navigation, it must pass the keys through to the page for this feature to work.

## Screen reader announcements

New toast messages are announced without moving focus. `error` uses an assertive `alert`; `success`, `info`, `warning`, and `loading` use a polite `status`. Removal and visual reordering do not trigger automatic announcements. Focusing a message button with the keyboard lets users read it again.

Rapid consecutive announcements may be skipped or interrupted depending on the browser and screen reader. This behavior was observed with VoiceOver; improvements are tracked separately. Sequential reading of every message is not guaranteed.

## Reduced motion

The library respects `prefers-reduced-motion: reduce`. Ketchup remains static, and hover enlargement and position transitions are disabled. If reduced motion is enabled when dismissal starts, the toast is removed without the bite animation. Duration and pause behavior are unchanged.

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
