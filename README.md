# iansteenstra.github.io

My personal website & portfolio, served by GitHub Pages at https://iansteenstra.github.io/.

It is plain HTML/CSS/JS with no build step: `index.html`, `gallery.html`, `css/simple.css`, `js/site.js`.

## Adding images

Put originals in `images/gallery/` or `images/portfolio/`, then run:

```sh
tools/optimize-images.sh
```

This writes web-sized WebP copies (`images/gallery/thumb/`, `images/gallery/large/`, `images/portfolio/web/`) that the pages reference. Requires `cwebp` (`brew install webp`).
