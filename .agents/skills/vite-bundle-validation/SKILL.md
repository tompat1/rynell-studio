---
name: vite-bundle-validation
description: Validate, build, and test deployment readiness of the rynell-studio application.
---

# Vite Bundle & Build Validation Skill

Use this skill when preparing the application for production build, auditing bundle sizes, or checking for broken links or assets.

## Validation Steps

1. **Lint & Code Quality**:
   - Run `npm run lint` (uses ESLint with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`, configured in `eslint.config.js`).
   - Fix any reported errors before proceeding to build.

2. **Environment Variables**:
   - Confirm `.env` contains `VITE_ELEVENLABS_API_KEY` and `VITE_ELEVENLABS_VOICE_ID`.
   - These are required for TTS to work. The app degrades gracefully without them, but verify intentionally.

3. **Build Test**:
   - Run `npm run build` to verify there are no compilation errors during bundling.
   - Check the `dist/` output — `import.meta.glob` for merch images will be inlined as asset hashes.

4. **Asset Verification**:
   - All images are in `src/assets/` (not `public/`). They are bundled by Vite — no manual verification of `public/` needed.
   - Verify that section background CSS variables in `index.css` use `/src/assets/...` paths (Vite resolves these correctly in dev; in production they resolve to hashed paths via the bundler).

5. **Local Production Test**:
   - Run `npm run preview` to locally test the production bundle and ensure there are no loading errors or dynamic import failures.
   - Pay special attention to: audio playback (ElevenLabs), image loading in Shop grid, and the mobile menu overlay.

