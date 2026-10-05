# Xerxes Angular

Converted from the supplied HTML/CSS/JavaScript website into an Angular 20 project.

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Build

```bash
npm run build
```

The production build is written under `dist/`.

## Notes

- Original visual styles, images and GLB models are preserved under `src/assets`.
- Original page JavaScript is loaded after each Angular page renders to preserve existing animations and interactions.
- Original `.html` URLs are registered as Angular routes, so existing navigation links continue to work.
- The Three.js projection code uses the same CDN import map as the original site; internet access is needed for Three.js and Google Fonts.
- When deploying to Apache/Nginx, configure SPA fallback routing to `index.html`.
