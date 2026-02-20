# Paletti — Agent Review & Improvement Plan

## Critical Review

### What's Good
- **Fun, original concept** — finding your color palette from skin tone is creative and genuinely useful.
- **Solid tech choices** — React 19, Vite 7, Tailwind 4, TypeScript. Modern stack, no bloat.
- **Client-side processing** — image compression + face detection all happen in-browser. Good for privacy.
- **Clean component decomposition** — `ImageUploadForm`, `PaletteFinderResults`, `HexCluster`, `ImagePreview` are well-scoped.
- **K-Means implementation** — writing your own clustering algorithm instead of pulling a library shows good fundamentals.

### What Needs Work

**🔴 Security: API Key Exposed Client-Side**
The Together AI API key is in `.env` as `VITE_TOGETHERAI_API_KEY` and gets bundled into the client JS. Anyone can open DevTools, find the key, and rack up charges on your account. This is the most urgent issue.

**🟡 Architecture: No Separation of Concerns**
`PaletteFinderResults.tsx` is doing too much — it manages LLM state, creates the Together AI client, parses responses, and renders UI all in one component. The LLM call logic, response parsing, and presentation should be separated.

**🟡 Fragile LLM Response Parsing**
The `//...//` delimiter convention for extracting the JSON array from the LLM response is brittle. If the model changes its output format slightly, the entire parsing breaks with a `JSON.parse` crash. There's no error handling around this.

**🟡 Dead Code & Placeholders**
- `ProtectedRoute` always returns `true` — it's dead weight that adds confusion.
- Login button in `Navbar` does nothing.
- `openai` and `axios` are in `package.json` but never used.
- `croppedImage` and `error` state in `useFaceDetection` are set but never read by consumers.

**🟡 Misplaced Utilities**
`getColorPalette.ts` lives in `hooks/` but exports pure functions (`getFacePixels`, `kMeans`, `rgbToHex`). These are utilities, not hooks.

**🟡 K-Means Initialization**
Using the first K pixels as initial centroids (instead of random or K-Means++ selection) can produce poor clusters if the first pixels happen to be similar. With face images where the top-left pixels are often background/transparent, this could skew results.

**🟠 State Management**
`Home.tsx` passes 4 state values + 3 setters through props across `ImageUploadForm` and `PaletteFinderResults`. This prop drilling will get worse as features are added (saved palettes, user accounts, history).

**🟠 No Error Boundaries**
If the LLM call fails, face detection crashes, or the image is corrupt, the user gets no feedback — just a stuck "Processing..." button or a white screen.

**🟠 No Tests**
Zero tests for the K-Means algorithm, color extraction, face detection flow, or component rendering.

**🟠 Accessibility**
- Color swatches show white text on potentially light backgrounds (low contrast).
- No `alt` text for face outline images.
- No loading skeleton or progress indicators during LLM calls.

---

## Phase 1: Security, Cleanup & Foundation

**Goal:** Fix the security hole, remove dead code, and organize the codebase properly.

### 1.1 — Move API Key Server-Side
- Create a lightweight backend endpoint (Netlify Function or similar) that proxies the Together AI call.
- Client sends hex values → serverless function calls Together AI → returns result.
- Remove `VITE_TOGETHERAI_API_KEY` from client env. Add the key only to Netlify environment variables.
- This also lets you add rate limiting later.

### 1.2 — Remove Dead Code
- Remove `ProtectedRoute` component and its usage in `App.tsx`.
- Remove the non-functional login button from `Navbar` (or replace with a "coming soon" tooltip).
- Remove `openai` and `axios` from `package.json` — they're unused dependencies.
- Remove unused `croppedImage`/`error` state exports from `useFaceDetection`.

### 1.3 — Reorganize File Structure
- Move `getColorPalette.ts` from `hooks/` to a new `src/utils/` or `src/lib/` directory.
- Rename it to something clearer like `colorClustering.ts`.
- Keep `hooks/` exclusively for actual React hooks.

### 1.4 — Add Error Handling
- Wrap `JSON.parse` in `PaletteFinderResults` with try/catch + user-facing error message.
- Add error states for the LLM call (network failure, rate limit, malformed response).
- Consider using structured output (JSON mode) from the LLM instead of the `//` delimiter hack.

### 1.5 — Rotate the Exposed API Key
- The key in `.env` (and git history) is compromised. Rotate it on Together AI immediately.
- Ensure `.env` is in `.gitignore` (verify it's not being tracked).

---

## Phase 2: Architecture & Robustness

**Goal:** Proper separation of concerns, testability, and reliability.

### 2.1 — Extract LLM Logic
- Create `src/hooks/useColorSuggestions.ts` (or `src/services/colorSuggestionService.ts`).
- Move Together AI client creation, prompt construction, API call, and response parsing out of `PaletteFinderResults`.
- `PaletteFinderResults` should only receive data and render it.

### 2.2 — Improve K-Means
- Use K-Means++ initialization (pick centroids that are maximally spread apart).
- Increase default iterations from 10 to 20.
- Add convergence check (stop early if centroids don't move).
- Filter out near-black/near-white pixels before clustering (shadow/highlight artifacts).

### 2.3 — Structured LLM Responses
- Switch prompt to request pure JSON output with a defined schema:
  ```json
  {
    "colors": { "summer": [...], "spring": [...], "fall": [...], "winter": [...] },
    "explanation": "...",
    "jewelry": "gold" | "silver" | "rose gold"
  }
  ```
- Use Together AI's JSON mode or a response format parameter.
- Validate response with a schema (zod or manual).

### 2.4 — Context or State Management
- Replace prop drilling with a `PaletteContext` or a simple reducer.
- Single state object: `{ image, face, skinTones, suggestions, status }`.
- Components subscribe to the slices they need.

### 2.5 — Add Tests
- Unit tests for `kMeans`, `rgbToHex`, `getFacePixels` (pure functions — easy to test).
- Integration test for the full pipeline with a known test image.
- Use Vitest (already compatible with Vite setup).

### 2.6 — Loading & Error UX
- Replace "Processing..." text with a spinner or skeleton.
- Add progress steps indicator: "Compressing → Detecting face → Extracting colors → Generating palette".
- Show meaningful error messages when things fail, with a retry button.

---

## Phase 3: Features & Polish

**Goal:** Take the app from MVP to something you'd be proud to show in a portfolio.

### 3.1 — Palette History (Local Storage)
- Save generated palettes to `localStorage` with timestamp and thumbnail.
- Add a "My Palettes" page to review past results.
- No backend needed — works offline.

### 3.2 — Improved Color Display
- Show color names alongside hex values (use a nearest-color library like `nearest-color` or `color-namer`).
- Add a "copy hex" button on each swatch.
- Group suggestions visually by season with labels.
- Add contrast-aware text color on swatches (dark text on light colors, light text on dark).

### 3.3 — Share & Export
- "Share my palette" button → generates a shareable image or link.
- Export palette as simple PNG collage.
- Open Graph meta tags so shared links show a preview.

### 3.4 — Accessibility Pass
- Ensure all interactive elements have proper focus states.
- Add `aria-label` to color swatches.
- Test with screen reader.
- Ensure color contrast meets WCAG AA for all text.

### 3.5 — Mobile Experience
- Test and optimize the camera capture flow on iOS/Android.
- Ensure hex swatches wrap nicely on small screens.
- Add touch-friendly tap-to-copy on color swatches.

### 3.6 — Performance
- Lazy-load `face-api.js` models only when user starts upload flow (code-split).
- Consider using a Web Worker for K-Means computation on large images.
- Add proper image dimension limits before processing.

---

## Summary

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Security fix, cleanup, file reorg, error handling | ✅ Done |
| **Phase 2** | Architecture, testing, better LLM integration, UX | ✅ Done |
| **Phase 3** | Features, polish, accessibility, sharing | ✅ Done |

The app has a great concept and a working MVP. The most critical action is **moving the API key server-side** — everything else is improvement. After Phase 1, you'll have a clean, secure foundation. After Phase 2, the code will be maintainable and testable. Phase 3 turns it into a portfolio-worthy project.
