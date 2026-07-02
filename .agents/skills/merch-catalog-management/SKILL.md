---
name: merch-catalog-management
description: Guidelines for adding, modifying, and managing the merch/product catalog in rynell-studio. Use when adding new shop items, updating product metadata, changing prices, adding color variants, or modifying the Shop component's data layer.
---

# Merch Catalog Management Skill

The product catalog in rynell-studio is **file-system driven** — merch images dropped into `src/assets/merch/` are auto-discovered via Vite's `import.meta.glob`. No separate data file or database is required.

## How the Catalog Works

In [Shop.jsx](file:///Users/thomasrynell/proj/rynell-studio/src/components/Shop.jsx):

1. **`import.meta.glob`** scans `src/assets/merch/*.{png,jpg,jpeg,webp,avif}` at build time and eagerly loads all images.
2. The filename (without extension) is used as the key to look up metadata in `predefinedMerch`.
3. If no entry exists in `predefinedMerch`, fallback values are used: `price: 45.00`, `details: 'Premium aesthetic artifact.'`, and auto-detected sizes.

## Naming Convention

Filenames follow the pattern: `{type}_{category}_{colorway}_{number}`

Examples:
- `hoodie_merch_blackout_07.webp`
- `cap_merch_tangerine_02.webp`
- `tee_merch_blackout_06.webp`

## Adding a New Product

1. **Add image**: Drop a `.webp` file into `src/assets/merch/`. Optimize to <300KB.
2. **Register metadata** in the `predefinedMerch` object in `Shop.jsx`:
   ```js
   'your_filename_without_extension': {
     title: 'PRODUCT DISPLAY TITLE',
     price: 55.00,
     details: 'One sentence material/fit description.',
     sizes: ['S', 'M', 'L', 'XL'] // or ['ONE SIZE'] for accessories
   }
   ```
3. **Size auto-detection**: If the filename contains `tee`, `hoodie`, `sweater`, `jacket`, `crewneck`, etc., sizes default to `['S', 'M', 'L', 'XL', 'XXL', 'XXXL']` automatically. Accessories default to `['ONE SIZE']`.
4. **Color auto-detection**: Known colorway strings in the filename (e.g. `blackout`, `tangerine_blast`) are auto-extracted and displayed as a color label.
5. **Search integration**: New products automatically appear in search results via `SEARCH_DATA` in [SearchDrawer.jsx](file:///Users/thomasrynell/proj/rynell-studio/src/components/SearchDrawer.jsx), which re-exports `merchData`.

## Known Colors

`tangerine_blast`, `panel_blue`, `midnight`, `blackout`, `milk_pop`, `newsprint_mist`, `chrome`, `zap_gold`, `cherry_boom`, `atomic_lime`

## Rules

- Always use `.webp` format. Max 300KB per product image.
- The first 4 items in `src/assets/merch/` (alphabetical order) are shown on the main Shop section. The rest are only visible in the "FULL CATALOG" archive overlay.
- `CartDrawer` and `DetailView` both rely on the same item shape: `{ id, image, title, price, details, sizes, color, size (selected) }`. Do not rename these fields.
