# CLAUDE.md

This file provides guidance to AI coding agents (Claude Code, pi, etc.) when working with code in this repository.

## Project Overview

Paletti is a web app that detects your skin tone from a photo and suggests a personalized color palette for clothing and jewelry. It uses face detection (face-api.js), K-Means clustering for dominant skin color extraction, and an LLM (Together AI) to generate color theory-based recommendations.

**Live:** https://paletti.netlify.app/

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 7** with SWC plugin for fast builds
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **React Router v7** for routing
- **face-api.js** for face detection + landmark extraction
- **browser-image-compression** for client-side image compression
- **Together AI SDK** for LLM color palette suggestions
- **react-markdown** for rendering LLM responses
- **pnpm** as package manager

## Project Structure

```
src/
├── App.tsx                        # Root component, BrowserRouter, routes
├── main.tsx                       # Entry point, StrictMode + ReactDOM
├── index.css                      # Tailwind imports, custom theme tokens, global styles
├── vite-env.d.ts                  # Vite type declarations
│
├── shared/
│   └── types.ts                   # SelectedPage enum
│
├── pages/
│   ├── Home.tsx                   # Main page — upload + results
│   ├── MyPalettes.tsx             # Saved palette history (localStorage)
│   ├── HowItWorks.tsx             # Explainer / disclaimers page
│   └── NotFound.tsx               # 404 page
│
├── components/
│   ├── Layout.tsx                 # Shared shell: Header + main + Footer + InstallPWA + <Outlet />
│   ├── Header.tsx                 # Header with PillNav, derives active page from useLocation()
│   ├── Footer.tsx                 # Footer with copyright + GitHub link
│   ├── ImageUploadForm.tsx        # Thin orchestrator: file input + camera toggle + detect button overlay
│   ├── CameraCapture.tsx          # Self-contained camera component (stream lifecycle, capture, close)
│   ├── PaletteFinderResults.tsx   # Displays hex clusters, LLM suggestions, image previews
│   ├── ImagePreview.tsx           # Image preview card
│   ├── HexCluster.tsx             # Renders array of hex color swatches with color names
│   └── InstallPWA.tsx             # PWA install prompt banner
│
├── hooks/
│   ├── useProcessImage.ts         # Full pipeline: compress → detect face → extract colors (lazy-loads face-api.js)
│   ├── useFaceDetection.ts        # face-api.js: load models, detect face, crop face region (legacy, used by useProcessImage)
│   ├── useImageCompression.ts     # browser-image-compression wrapper (stable callback via useRef)
│   └── useColorSuggestions.ts     # LLM color suggestion fetch + state management
│
├── context/
│   └── PaletteContext.tsx         # Centralized state: image, face, colors, suggestions, processing step
│
├── utils/
│   ├── colorClustering.ts         # getFacePixels, kMeans++ clustering, rgbToHex
│   ├── colorClustering.test.ts    # Unit tests (Vitest)
│   ├── colorHelpers.ts            # isLightColor(), getColorName() — shared color utilities
│   ├── paletteHistory.ts          # localStorage CRUD for saved palettes
│   └── exportPalette.ts           # Canvas-based PNG export with roundRect polyfill
│
├── assets/
│   └── logo.png                   # Paletti logo
│
netlify/
└── functions/
    └── color-suggestions.mts      # Serverless proxy for Together AI LLM calls

public/
├── paletti.svg                    # Favicon
├── logo-192.png                   # PWA icon 192x192
├── logo-512.png                   # PWA icon 512x512
└── models/                        # face-api.js model weights
    ├── ssd_mobilenetv1_model-*    # Face detection model
    └── face_landmark_68_*         # Facial landmark models
```

## Application Flow

1. User uploads or captures a photo
2. User clicks "Detect Face" (overlaid on the image preview)
3. `useProcessImage` runs the full pipeline:
   a. Image is compressed client-side (`useImageCompression`)
   b. face-api.js is lazy-loaded on first use (code-split chunk)
   c. Face detection extracts landmarks, full face region is cropped
   d. K-Means++ clustering finds 5 dominant skin tone HEX values
4. User clicks "find my palette!" → HEX values sent to Together AI LLM
5. LLM returns 12 suggested colors (3 per season) + explanation + jewelry recommendation
6. Results rendered with color swatches (with human-readable color names) and markdown explanation
7. User can save, export as PNG, or regenerate

## Commands

```bash
pnpm install          # install dependencies
pnpm run dev          # start Vite dev server
pnpm run build        # TypeScript check + production build
pnpm run test         # run unit tests (Vitest)
pnpm run test:watch   # run tests in watch mode
pnpm run lint         # ESLint
pnpm run preview      # preview production build locally
```

## Environment Variables

The Together AI API key is configured **server-side only** as a Netlify environment variable:

- **Netlify Dashboard** → Site settings → Environment variables → `TOGETHERAI_API_KEY`

No client-side API keys are needed. The client calls `/api/color-suggestions` which is proxied to a Netlify Function.

## CI/CD

- **GitHub Actions** (`build.yml`): Runs `pnpm run build` on PRs to `master`/`develop`
- **Deployment:** Netlify (automatic)

## Code Patterns

- Path alias `@/` maps to `src/`
- Custom Tailwind theme tokens defined in `index.css` under `@theme` (colors, fonts, breakpoints)
- Components use Tailwind utility classes directly, no CSS modules
- face-api.js lazy-loaded via dynamic `import()` — only fetched when user triggers face detection
- Object URLs tracked and revoked systematically to prevent memory leaks
- LLM calls proxied through Netlify Function (`/api/color-suggestions`) — no client-side API keys
- LLM returns structured JSON; server-side validation with fallback parsing
- Rounded corners throughout (buttons, cards, swatches, camera viewfinder) for soft aesthetic
- Tap-to-copy on all color swatches with toast feedback
- Saved palettes stored in localStorage (max 20), viewable on `/mypalettes`
- Export palette as PNG via canvas rendering

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `face-api.js` | Face detection + landmark extraction (SSD MobileNet + 68-point landmarks) — lazy-loaded |
| `browser-image-compression` | Client-side image compression before processing |
| `together-ai` | Together AI SDK for LLM chat completions |
| `react-markdown` | Render LLM markdown responses |
| `react-router` | Client-side routing (v7) |
| `tailwindcss` | Utility-first CSS framework (v4) |
| `color-namer` | Human-readable color names for hex values |
| `vite-plugin-pwa` | PWA support: manifest, service worker, install prompt |

## State Management

`PaletteContext` provides centralized state for the entire palette flow:
- Image state: `imageUploaded`, `faceOutlined`, `hexCluster`, `faceDetected`
- Processing: `processingStep` (idle → compressing → detecting → extracting → done/error)
- LLM: `suggestions`, `suggestionsLoading`, `suggestionsError`
- Actions: `fetchSuggestions`, `resetAll`, `resetForNewImage`

Components consume via `usePalette()` hook — no prop drilling.

## Serverless Functions

The LLM call is handled by a Netlify Function at `netlify/functions/color-suggestions.mts`:
- Client POSTs `{ hexCluster: string[] }` to `/api/color-suggestions`
- Rate limited: 5 requests/min per IP (in-memory sliding window)
- System prompt requests structured JSON: `{ seasons: { spring, summer, fall, winter }, explanation, jewelry }`
- Response validated with schema checker; handles markdown fences, malformed JSON gracefully
- Redirects configured in `netlify.toml`: `/api/*` → `/.netlify/functions/:splat`

## Testing

Unit tests with Vitest (`pnpm run test`):
- `colorClustering.test.ts` — K-Means clustering, rgbToHex, edge cases (empty input, single pixel, convergence)

## PWA Support

Paletti is a Progressive Web App:
- `vite-plugin-pwa` generates manifest and service worker
- Face-api model files use `CacheFirst` runtime caching (30-day expiry)
- `InstallPWA` component shows a dismissible install banner via `beforeinstallprompt`
- Apple touch icon and theme-color meta tags in `index.html`

## Known Issues

- Bundle still large (~670KB main + ~684KB face-api lazy chunk) — face-api.js is code-split but still big
