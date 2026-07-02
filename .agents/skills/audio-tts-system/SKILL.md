---
name: audio-tts-system
description: Guidelines for working with the ElevenLabs TTS audio system and AudioContext in rynell-studio. Use when adding, debugging, or modifying voice narration, the mute toggle, or any feature that calls playTTS or stopAudio.
---

# Audio & TTS System Skill

Rynell Studio uses ElevenLabs Text-to-Speech to narrate journal articles and play a one-time greeting on first load. The system is built around [AudioContext.jsx](file:///Users/thomasrynell/proj/rynell-studio/src/contexts/AudioContext.jsx) and [services/elevenlabs.js](file:///Users/thomasrynell/proj/rynell-studio/src/services/elevenlabs.js).

## Environment Variables

Stored in `.env` (never commit this file):
```
VITE_ELEVENLABS_API_KEY=...
VITE_ELEVENLABS_VOICE_ID=...
```

Access in code via `import.meta.env.VITE_ELEVENLABS_API_KEY`.

## AudioContext API

The `AudioProvider` wraps the whole app in `main.jsx`. Any component can access audio via:
```js
const { playTTS, stopAudio, isPlaying, isMuted, toggleMute } = useAudio();
```

| Function | Description |
|---|---|
| `playTTS(text, options?)` | Synthesizes and plays text. No-ops if `isMuted`. Stops any currently playing audio first. |
| `stopAudio()` | Pauses and resets the audio element. |
| `toggleMute()` | Toggles global mute. Persists to `audioRef.current.muted`. |
| `isPlaying` | Boolean — true while audio is actively playing. |

### `playTTS` options
```js
playTTS(text, {
  preloadedUrl: string,    // Skip synthesis, use a pre-fetched blob URL
  playbackRate: number     // Default 1.0. Use 0.85 for more deliberate delivery.
})
```

## Preloading Pattern (Loader)

The greeting audio is **preloaded during the Loader phase** to avoid a delay after the loader completes:

```js
// In Loader.jsx — fetch audio while loader is visible
const url = await synthesizeSpeech("Welcome...", voiceId, apiKey);
setPreloadedAudioUrl(url);

// After loader finishes — play immediately from blob URL
playTTS("Welcome...", { preloadedUrl: preloadedAudioUrl, playbackRate: 0.85 });
localStorage.setItem('hasHeardGreeting', 'true');
```

The greeting only plays **once per browser session** (gated by `localStorage.getItem('hasHeardGreeting')`).

## Journal "Read To Me" Feature

In [DetailView.jsx](file:///Users/thomasrynell/proj/rynell-studio/src/components/DetailView.jsx), the "▶ READ IT TO ME" button passes `item.content` directly to `playTTS`. The button toggles to "⏹ STOP" while `isPlaying` is true.

When navigating between journal articles (`handleNavigate`), `stopAudio()` is always called to prevent audio from the previous article continuing.

## Rules

1. **Always check `isMuted` before triggering audio** — `playTTS` handles this internally, but do not call `synthesizeSpeech` directly in a component (use `playTTS` instead).
2. **Revoke object URLs** to prevent memory leaks — `AudioContext` does this automatically in the `onended` handler for non-preloaded URLs.
3. **Never play audio on hover or on scroll** — only trigger on explicit user action (button click) or on first-visit loader completion.
4. **ElevenLabs model**: `eleven_multilingual_v2` with `stability: 0.5`, `similarity_boost: 0.75`. Do not change these without testing the voice quality.
5. If API key is missing, `synthesizeSpeech` returns `null` silently — the app should degrade gracefully (no audio, no error shown to user).
