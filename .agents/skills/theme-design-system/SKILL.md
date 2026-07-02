---
name: theme-design-system
description: Guidelines for the dark/light theme system, CSS design tokens, and the brutalist visual language of rynell-studio. Use when modifying colors, adding new sections, changing typography, working with the theme toggle, or applying the established visual style to new components.
---

# Theme & Design System Skill

Rynell Studio uses a **brutalist comic-book aesthetic** — bold typography, hard drop-shadows, skewed elements, halftone patterns, and an orange/blue/black palette. All tokens live in [index.css](file:///Users/thomasrynell/proj/rynell-studio/src/index.css).

## Design Tokens

### Brand Colors (constant across themes)
| Token | Value | Use |
|---|---|---|
| `--primary-orange` | `#FF6A00` | CTAs, prices, accent borders, highlights |
| `--secondary-blue` | `#007BFF` | Active states, hover accents, selected sizes |
| `--dark-blue` | `#0A1E3F` | Section backgrounds, deep layers |
| `--yellow` | `#FFB400` | Section labels (comic-book tags) |
| `--black` / `--white` | `#000` / `#FFF` | Hard borders, box shadows |

### Theme-Aware Tokens
Always use these — **never hardcode colors** in components:

| Token | Dark | Light |
|---|---|---|
| `--bg-primary` | `#000000` | `#FFFFFF` |
| `--bg-secondary` | `#020813` | `#F5F5F5` |
| `--bg-card` | `#051024` | `#FFFFFF` |
| `--text-primary` | `#FFFFFF` | `#000000` |
| `--text-secondary` | `rgba(255,255,255,0.8)` | `#333333` |
| `--border-color` | `rgba(255,255,255,0.1)` | `rgba(0,0,0,0.15)` |

### Section Background Images
Each section has a separate background image per theme:
- `--bg-about`, `--bg-ads`, `--bg-collections`, `--bg-shop`, `--bg-journal`
- Dark mode images: `src/assets/section_backgrounds/0X_section_bg_dark.webp`
- Light mode images: `src/assets/section_backgrounds/0X_section_bg_light.webp`

## Typography

```css
--font-heading: 'Bebas Neue', sans-serif;  /* All caps, bold titles, section headers */
--font-body: 'Poppins', sans-serif;        /* Body text, labels, prices, buttons */
```

**Heading usage rules:**
- Always `text-transform: uppercase`
- Use `letter-spacing: 2px` or more
- Apply `transform: skewX(-10deg)` on hero titles for the brutalist slant

## Theme Toggle

Controlled in `App.jsx` via `const [theme, setTheme] = useState('dark')`. The active theme class (`dark-theme` / `light-theme`) is applied to `document.body` and to the root `<div className="app">`.

The Navbar passes `theme` and `setTheme` down to toggle between them. All sections receive the theme via CSS cascade — **no prop drilling of theme is needed in child components**.

## Visual Language Rules

1. **Hard shadows**: Buttons and key UI elements use `box-shadow: 4px 4px 0 #000` (no blur). This is the signature brutalist effect.
2. **Skew**: Titles and CTAs use `transform: skewX(-10deg)`. Never use `skewY`.
3. **Section labels**: Use the `.section-label` utility class — yellow background, rotated -3deg, comic-book style.
4. **Halftone pattern**: Apply `.bg-halftone` to section wrappers to add the dot-grid texture (defined as a pseudo-element).
5. **CSS-in-JSX**: Each component owns its styles via `<style>{`...`}</style>` inside the JSX. This is intentional — do not move styles to external `.css` files or CSS modules.
6. **Comic text effect**: `.comic-text` (orange shadow) and `.comic-text-blue` (blue shadow) are utility classes for headline text effects.

## Adding a New Section

1. Give the section a unique `id` matching the nav anchor (e.g. `id="collections"`).
2. Add a `<div className="section-label">SECTIONNAME</div>` at the top.
3. Use `var(--bg-primary)` / `var(--text-primary)` etc. for all colors.
4. If it needs a section background image, add two image files (dark + light) and register new CSS variables in `:root` and `.light-theme`.
5. Add the section to `navItems` in `Navbar.jsx` with a representative thumbnail image.
