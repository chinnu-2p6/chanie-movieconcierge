# Movie Concierge

A neumorphic movie recommendation app (React + Vite, no Tailwind required — all styling is inline).

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — plain HTML/CSS/JS, deployable anywhere.

## Deploy (pick one, all free, none show a claude.ai URL)

### Vercel (easiest)
1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Framework preset: Vite. Click Deploy.
4. You get a URL like `movie-concierge.vercel.app` (or attach your own domain).

### Netlify
1. Push to GitHub, or drag-and-drop the `dist/` folder (after `npm run build`) straight into app.netlify.com/drop.
2. Instant public URL like `movie-concierge.netlify.app`.

### GitHub Pages
1. `npm install -D gh-pages`
2. Add to `package.json` scripts: `"deploy": "vite build && gh-pages -d dist"`
3. Set `base: '/your-repo-name/'` in `vite.config.js`.
4. `npm run deploy` → live at `https://<username>.github.io/<repo-name>/`

## Notes
- Uses the Web Audio API for the knob click sound — works in any modern browser, no extra setup.
- Fonts (Inter, Poppins) load from Google Fonts via the `<link>` tags in `index.html`.
- Icons come from `lucide-react` (installed via npm, bundled at build time).
