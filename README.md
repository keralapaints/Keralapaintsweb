# Kerala Paints — Beyond Beautiful Walls - KP Story 

A one-page website that tells the Kerala Paints story as you scroll.

- **The story**: ten chapters joined by short films. Scrolling plays the films forwards, scrolling back plays them
  backwards.
- **The Product Range**: a carousel of eight product types, a paint-splash scene, three home scenes, and an enquiry
  form with the footer at the end.
- **Reduced motion**: visitors who turn motion off get a simple, still version of the same page.

It is a static site. There is no server or database.

## Versions

| Tool | Version |
|---|---|
| Node.js | 22 or newer (tested on 24.19) |
| npm | 10 or newer (tested on 11.17) |
| Next.js | 16.3.4 |
| React / React DOM | 19.3.0 |
| TypeScript | 5.9 |
| GSAP (scroll animation) | 3.15.0 |
| Lenis (smooth scrolling) | 1.3.26 |
| Tailwind CSS | 4.3.3 |
| ESLint | 9 |
| tsx (runs the tests) | 4.23 |

Exact versions are in `package.json` and `package-lock.json`.

## Getting started

```bash
npm ci
npm run dev
```

Then open <http://localhost:8000>. Phones on the same Wi-Fi can open it too, using your computer's IP address and
port 8000.

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install dependencies |
| `npm run dev` | Start the dev server on port 8000 (reachable from your network) |
| `npm run dev:local` | Start the dev server on this computer only |
| `npm run build` | Build the finished site into `out/` |
| `npm start` | Preview the built site on port 3001 |
| `npm run lint` | Check the code style |
| `npm run typecheck` | Check the TypeScript types |
| `npm test` | Run the tests |

The first build needs internet access because the fonts come from Google Fonts.

## Deploying

Run `npm run build` and upload the `out/` folder to any static host. `vercel.json` and `public/_headers` set how long
browsers cache the media.

## Folders

```
app/                  page, layout and global CSS (globals.css only imports app/styles/*.css)
components/site/      header, menu and loading screen
components/story/     the ten-chapter scroll story
components/products/  Product Range, splash, home scenes, enquiry form and footer
data/                 all the words on the site and the product list
lib/                  small helpers (maths, screen size, scrolling)
lib/media/            loading and drawing the films
lib/story/            story timing and the opening video
lib/product/          product data and timing
hooks/                shared React hooks
public/               films, frames, still images and icons
public/images/brand/  supplied logo, prepared as a cropped white SVG
```

## Changing the text

Every word on the site lives in `data/`, so you never need to touch the components to change copy:

| File | What's in it |
|---|---|
| `data/story.ts` | the ten story chapters |
| `data/products.ts` | the eight product types, the splash and the home scenes |
| `data/navigation.ts` | header links |
| `data/enquiry.ts` | the enquiry form labels and messages |
| `data/site.ts` | page title, menu, loading screen and footer |

## Films and images

- The scroll films are not videos. Each one is a pack of still frames in `public/frames/` that is drawn on a canvas
  as you scroll. This keeps them smooth on phones.
- The opening film (`public/films/hero-idle.mp4`) is a normal looping video.
- Product backgrounds are short looping videos in `public/films/product-bg/`.
- Still images in `public/stills/` are used as posters and for the reduced-motion version.


## Rules for contributors (AGENTS.md)

[`AGENTS.md`](AGENTS.md) holds the house rules for this project, for people and for coding assistants alike:

- where each kind of file belongs and how to name it
- code style (strict TypeScript, named exports, British spelling in comments)
- no hard-coded text in components; it goes in `data/`
- every animation needs a reduced-motion version
- run `npm run lint`, `npm run typecheck` and `npm test` before you finish, and check the page on desktop and phone

`CLAUDE.md` simply points to `AGENTS.md`, so there is one set of rules. The top block of `AGENTS.md` is written by
`next dev`; leave it as it is.


## Known gaps

- Some menu links (Colours, Technology, Find an Outlet, Warranty, Gallery) go nowhere yet.
- The enquiry form only sends if `NEXT_PUBLIC_ENQUIRY_ENDPOINT` is set when building. Without it, the form tells the
  visitor their details were not sent.
- Before launch, add the real site address and a full Open Graph image link in `app/layout.tsx`.
