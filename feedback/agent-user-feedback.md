# Paletti — Agent Feedback & Future Improvements

## Completed Refactoring

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Security (API key server-side), dead code removal, file reorg, error handling | ✅ Done |
| **Phase 2** | PaletteContext, K-Means++, structured JSON LLM, Vitest tests, step indicator | ✅ Done |
| **Phase 3** | Rounded UI, palette history, export PNG, copy-to-clipboard, accessibility, OG tags | ✅ Done |

---

## Current State — What's Good

- **Clean architecture** — context-driven state, hooks for logic, utils for pure functions, serverless for secrets
- **No client-side secrets** — API key lives only in Netlify env vars
- **Full face detection** — forehead arc from eyebrow landmarks, not just jaw
- **5-cluster K-Means++** with convergence + shadow/highlight filtering
- **Structured LLM responses** — JSON schema with multi-layer fallback parsing
- **10 passing unit tests** for clustering logic
- **Polished UI** — rounded everything, tap-to-copy, step indicator, season cards
- **Offline-capable history** — localStorage with export

---

## Remaining Issues & Improvement Ideas

### 🔴 High Priority

#### 1. `isLightColor()` is duplicated in 3 files
The same function exists in `PaletteFinderResults.tsx`, `MyPalettes.tsx`, and `exportPalette.ts`. Extract it to `src/utils/colorHelpers.ts` and import everywhere.

#### 2. `compressImage` dependency array passes object reference
In `useImageCompression.ts`, the `compressImage` callback has `defaultOptions` in its dependency array, but since `defaultOptions` is an object literal passed from the caller, it creates a new reference every render. This means `compressImage` is re-created on every render, which cascades re-creations of `handleSubmit` in `ImageUploadForm`. Fix: memoize the options in the caller, or use `useRef` for stable options.

#### 3. No rate limiting on the serverless function
Anyone can spam `/api/color-suggestions` and burn through your Together AI credits. Add basic rate limiting — even a simple per-IP cooldown via Netlify Blobs or an in-memory map would help.

#### 4. PNG export relies on `ctx.roundRect()` 
`CanvasRenderingContext2D.roundRect()` is relatively new (Chrome 99+, Safari 16+). Older browsers or some WebViews will crash. Add a polyfill or fallback to `ctx.rect()`.

### 🟡 Medium Priority

#### 5. Navbar `selectedPage` state doesn't sync with URL
If the user navigates via browser back/forward, the navbar highlight stays stale because `selectedPage` is local `useState` initialized once from `location.pathname`. Use `useLocation()` from react-router instead:
```tsx
const { pathname } = useLocation();
// derive selectedPage from pathname reactively
```
This also eliminates the `Header` wrapper component entirely — fold it into `Navbar`.

#### 6. `ImageUploadForm` is still 296 lines
Even after extracting context, this component handles file input, camera stream, capture, canvas conversion, compression, face detection, and color extraction. Consider splitting:
- `CameraCapture` component (video, start/stop/capture)
- `useProcessImage` hook (compress → detect → extract pipeline)
- `ImageUploadForm` becomes a thin orchestrator

#### 7. Object URL memory leaks
`URL.createObjectURL()` is called in several places but revocation is inconsistent. The cleanup effect in `ImageUploadForm` runs on unmount, but intermediate URLs (e.g., from `fileToCanvas`) are properly revoked while `faceOutlined` URLs from the context's `resetAll` only revoke on full reset. If the user generates multiple palettes without resetting, previous face URLs leak. Consider tracking all created URLs in a ref and revoking them systematically.

#### 8. face-api.js model loading has no error handling
If model files fail to load (network error, 404, corrupt file), the `loadModels` function will throw but the error isn't surfaced to the user — it just shows "Face not detected." Add a try/catch around model loading with a specific error message like "Failed to load face detection models. Check your connection."

#### 9. No retry mechanism for LLM calls
If the LLM returns a malformed response (`parseError: true`), the user sees the raw text but has no way to retry with the same skin tones. The "find my palette!" button disappears once `suggestions` is set. Add a "🔄 Try again" button that clears suggestions and re-fetches.

#### 10. Export PNG doesn't include explanation text
The exported image has swatches and jewelry but no explanation. For sharing purposes, even a truncated version of the explanation would make the PNG more useful.

### 🟠 Low Priority / Nice-to-Have

#### 11. Bundle size (1.05 MB)
`face-api.js` dominates the bundle. Options:
- **Lazy import** via `React.lazy()` + dynamic `import()` — only load face-api when the user actually uploads a photo
- **Manual chunks** in Vite config to split face-api into its own chunk
- Investigate lighter alternatives like `@mediapipe/face_mesh` (smaller, WebAssembly-based)

#### 12. Web Share API
On mobile, use `navigator.share()` to share the exported PNG directly to messaging apps, social media, etc. Falls back to download on desktop.

#### 13. Color naming
Show human-readable color names alongside hex values (e.g., "#c4956a → Warm Sand"). Libraries like `color-namer` or `nearest-color` can do this. Particularly helpful for accessibility.

#### 14. Dark mode
The app currently has a light-only theme. A dark mode would be straightforward with Tailwind's `dark:` variant — the rounded card aesthetic works well in both modes.

#### 15. Comparison view
Let users compare two saved palettes side-by-side — useful for seeing how results vary between photos or sessions.

#### 16. Serverless function tests
The Netlify function has validation logic and multi-layer JSON parsing that should be unit tested. Extract the parsing logic into a pure function and test it separately.

#### 17. E2E tests
The full flow (upload → detect → suggest → save → export) would benefit from a Playwright or Cypress test, even just a smoke test that verifies the pipeline doesn't crash.

#### 18. PWA support
Add a `manifest.json` and service worker for installability. The app already works offline for saved palettes — making it a PWA would be a natural fit.

#### 19. Accessibility: keyboard navigation for swatch grid
Color swatches are buttons and focusable, but there's no arrow-key navigation within the grid. Adding `role="grid"` with arrow key support would improve keyboard UX.

#### 20. Analytics
Consider adding privacy-friendly analytics (Plausible, Umami) to understand usage patterns — how many users complete the full flow, where they drop off, which seasons are most popular, etc.

---

## Suggested Priority Order

1. Extract `isLightColor()` to shared util (5 min)
2. Fix navbar URL sync with `useLocation()` (15 min)
3. Add `roundRect` polyfill for export (10 min)
4. Fix `compressImage` dependency stability (10 min)
5. Add rate limiting to serverless function (30 min)
6. Split `ImageUploadForm` into smaller pieces (1 hr)
7. Add model loading error handling (15 min)
8. Add LLM retry button (15 min)
9. Lazy-load face-api.js for bundle size (30 min)
10. Everything else as time/interest allows
