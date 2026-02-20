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
│   ├── Layout.tsx                 # Shared shell: Header + main + Footer + <Outlet />
│   ├── Header.tsx                 # Header wrapper with selectedPage state
│   ├── Navbar.tsx                 # Navigation bar with page links
│   ├── Footer.tsx                 # Footer with copyright + GitHub link
│   ├── ImageUploadForm.tsx        # File upload, compression, face detection trigger
│   ├── PaletteFinderResults.tsx   # Displays hex clusters, LLM suggestions, image previews
│   ├── ImagePreview.tsx           # Image preview card
│   └── HexCluster.tsx             # Renders array of hex color swatches
│
├── hooks/
│   ├── useFaceDetection.ts        # face-api.js: load models, detect face, crop jaw region
│   ├── useImageCompression.ts     # browser-image-compression wrapper
│   └── useColorSuggestions.ts     # LLM color suggestion fetch + state management
│
├── context/
│   └── PaletteContext.tsx         # Centralized state: image, face, colors, suggestions, processing step
│
├── utils/
│   ├── colorClustering.ts         # getFacePixels, kMeans++ clustering, rgbToHex
│   ├── colorClustering.test.ts    # Unit tests (Vitest)
│   ├── paletteHistory.ts          # localStorage CRUD for saved palettes
│   └── exportPalette.ts           # Canvas-based PNG export of palette
│
├── assets/
│   └── logo.png                   # Paletti logo
│
netlify/
└── functions/
    └── color-suggestions.mts      # Serverless proxy for Together AI LLM calls

public/
├── paletti.svg                    # Favicon
└── models/                        # face-api.js model weights
    ├── ssd_mobilenetv1_model-*    # Face detection model
    └── face_landmark_68_*         # Facial landmark models
```

## Application Flow

1. User uploads or captures a photo
2. Image is compressed client-side (`useImageCompression`)
3. Face detection via `face-api.js` extracts jaw landmarks (`useFaceDetection`)
4. Jaw region is cropped and clipped to a canvas
5. Pixel data extracted, K-Means clustering finds 3 dominant skin tone HEX values (`getColorPalette.ts`)
6. User clicks "find my palette!" → HEX values sent to Together AI LLM
7. LLM returns 12 suggested colors (3 per season) + explanation + jewelry recommendation
8. Results rendered with color swatches and markdown explanation

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
- Face detection models loaded lazily on first use (ref-guarded)
- LLM calls proxied through Netlify Function (`/api/color-suggestions`) — no client-side API keys
- LLM returns structured JSON; server-side validation with fallback parsing
- Rounded corners throughout (buttons, cards, swatches, camera viewfinder) for soft aesthetic
- Tap-to-copy on all color swatches with toast feedback
- Saved palettes stored in localStorage (max 20), viewable on `/mypalettes`
- Export palette as PNG via canvas rendering

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `face-api.js` | Face detection + landmark extraction (SSD MobileNet + 68-point landmarks) |
| `browser-image-compression` | Client-side image compression before processing |
| `together-ai` | Together AI SDK for LLM chat completions |
| `react-markdown` | Render LLM markdown responses |
| `react-router` | Client-side routing (v7) |
| `tailwindcss` | Utility-first CSS framework (v4) |

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
- System prompt requests structured JSON: `{ seasons: { spring, summer, fall, winter }, explanation, jewelry }`
- Response validated with schema checker; handles markdown fences, malformed JSON gracefully
- Redirects configured in `netlify.toml`: `/api/*` → `/.netlify/functions/:splat`

## Testing

Unit tests with Vitest (`pnpm run test`):
- `colorClustering.test.ts` — K-Means clustering, rgbToHex, edge cases (empty input, single pixel, convergence)

## Known Issues

- Large bundle size (~1MB) — face-api.js could be code-split
