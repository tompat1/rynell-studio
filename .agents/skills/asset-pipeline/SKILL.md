---
name: asset-pipeline
description: Optimize, scale, and convert assets for the rynell-studio workspace. Use when adding images for merch, journal articles, campaigns, collections, services, or section backgrounds.
---

# Asset Pipeline Skill

Use this skill to optimize and organize images for rynell-studio. Assets are served directly from `src/assets/` (not `public/`) and are auto-discovered by Vite's `import.meta.glob` — no catalog script is needed.

## Directory Structure

```
src/assets/
├── merch/              ← Product images for Shop (auto-discovered)
├── campaigns/          ← Campaign/ad imagery
├── collection/         ← Collection section images
├── journal/            ← Journal article hero images
├── services/           ← Service offering images
├── section_backgrounds/← Section BG images (dark + light variants)
└── *.webp / *.svg      ← Root-level brand assets (logo, hero, loader)
```

## Workflow

1. **Prepare the image**: Convert to `.webp` at ~80% quality using `ffmpeg`, `sharp`, or `squoosh`.
   - Merch product images: target 200–350KB, square aspect ratio preferred.
   - Section backgrounds: target <500KB, 1920px wide.
   - Journal/campaign images: target <300KB, 16:9 or 3:2.
2. **Follow the naming convention**:
   - Merch: `{type}_merch_{colorway}_{number}.webp` (e.g. `hoodie_merch_blackout_07.webp`)
   - Campaigns: `campaign_{number}.webp`
   - Section BGs: `{number}_section_bg_{dark|light}.webp`
3. **Drop into the correct directory** under `src/assets/`.
4. **For merch**: also register metadata in `predefinedMerch` in [Shop.jsx](file:///Users/thomasrynell/proj/rynell-studio/src/components/Shop.jsx). See the `merch-catalog-management` skill.
5. **No build step needed**: `import.meta.glob` picks up new files automatically on next `npm run dev` start.

## Rules
- Never commit raw PNGs/JPGs > 500KB or high-res videos > 10MB without optimization.
- All images must be `.webp` (or `.svg` for vector graphics). Never use `.png` or `.jpg` for new assets.
- Section backgrounds require **two** variants (dark + light) and CSS variable registration in `index.css`.
