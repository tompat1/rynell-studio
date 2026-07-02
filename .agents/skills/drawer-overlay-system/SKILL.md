---
name: drawer-overlay-system
description: Guidelines for working with the slide-in drawer and full-screen overlay system in rynell-studio. Use when adding, modifying, or debugging CartDrawer, SearchDrawer, AccountDrawer, ContactDrawer, CheckoutDrawer, DetailView, or ShopArchive overlays.
---

# Drawer & Overlay System Skill

Rynell Studio uses two distinct layer patterns for panels — **side drawers** (slide in from the right) and **full-screen overlays** (slide up from the bottom). This skill governs both.

## Architecture

All drawer/overlay state lives in [App.jsx](file:///Users/thomasrynell/proj/rynell-studio/src/App.jsx) as individual `useState` booleans (e.g. `isCartOpen`, `isSearchOpen`). No external state library is used.

### Side Drawers
- `CartDrawer`, `SearchDrawer`, `AccountDrawer`, `ContactDrawer`, `CheckoutDrawer`
- Slide in from the right. Use CSS class `cart-drawer open` toggled by the boolean prop.
- Always render a `drawer-backdrop` sibling that closes the drawer on click.
- Lock body scroll when open: `document.body.classList.add('drawer-open')` — clean up in `useEffect` return.

### Full-Screen Overlays
- `DetailView` — slides up with `animation: slideUp`. Rendered directly in the JSX tree, conditionally if `item != null`.
- `ShopArchive` — slides up from bottom using CSS `translateY(100%)` → `translateY(0)`. Rendered via `createPortal(…, document.body)` inside `Shop.jsx`.
- Mobile menu overlay — slides down from top using `translateY(-100%)` → `translateY(0)`. Lives inside `Navbar.jsx`.

## Z-Index Hierarchy
```
3000 — DetailView
2000 — Mobile Menu, ShopArchive
1001 — Drawer Backdrop
1000 — Drawers (cart, search, etc.), Navbar
9999 — Scroll-to-top button (hidden during drawer-open)
```

## Key Rules

1. **Always add/remove `drawer-open` class on `document.body`** to hide the scroll-to-top button and prevent scroll interference.
2. **Use `createPortal(…, document.body)`** for any overlay that needs to escape a stacking context (e.g. ShopArchive inside a `<section>`).
3. **Never create a new global state manager**. Add new drawer booleans to `App.jsx` and pass them as props.
4. **Escape key / backdrop close** — all drawers close on backdrop click. Add `keydown` listeners for Escape if adding a new drawer.
5. **Transition timing** — drawers use `cubic-bezier(0.19, 1, 0.22, 1)` for a premium snap feel. Use `0.4s` for drawers, `0.6s` for full-screen overlays.
