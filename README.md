# Paletti

![Paletti Logo](./src/assets/logo.png)

> Upload a photo, detect your skin tone, and discover your personalized color palette for clothing and jewelry.

**Live:** https://paletti.netlify.app/

## How It Works

1. **Upload or capture** a photo of your face
2. **Image compression** — optimized client-side before processing
3. **Face detection** — `face-api.js` identifies facial landmarks and isolates the jaw/cheek region
4. **Color extraction** — K-Means clustering finds 3 dominant skin tone HEX values
5. **AI suggestions** — an LLM generates a 12-color palette (3 per season) based on color theory, plus jewelry recommendations

All image processing happens **locally in your browser** — no photos are uploaded to any server.

## Tech Stack

- React 19 + TypeScript
- Vite 7 + Tailwind CSS 4
- face-api.js (SSD MobileNet + 68-point landmarks)
- Together AI (LLM for color suggestions)
- Deployed on Netlify

## Getting Started

```bash
pnpm install
pnpm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_TOGETHERAI_API_KEY=<your-together-ai-api-key>
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Start dev server |
| `pnpm run build` | TypeScript check + production build |
| `pnpm run lint` | ESLint |
| `pnpm run preview` | Preview production build |

## Contributing

Run `pnpm run build` before opening a PR.

## License

© 2025 Victor Medeiros
