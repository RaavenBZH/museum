# Met Museum Explorer

A React single-page application built on the public
[Metropolitan Museum of Art collection API](https://metmuseum.github.io/).

## Overview

Met Museum Explorer turns the Metropolitan Museum of Art's open collection API
into a game of discovery. Instead of a search box, the visitor is shown **one
artwork at a time, drawn at random**, with the museum's own record beside it.
Every artwork seen is kept in **My Gallery**, which shows them all in a grid or
a list and measures how much of the collection the visitor has been through.

The data is one department of the museum: **European Paintings**, department
11, whose 2,650 records are the whole the application draws from and counts
against. The museum lists 503,459 objects in all; the application deliberately
exploits one slice of the API thoroughly rather than every endpoint shallowly.

Why these choices:

- **One department, European Paintings.** A screen built around one large
  picture needs works that are photographed, dated and measured. This
  department is almost entirely paintings, and its identifier list is small
  enough to read in a single call.
- **A random draw rather than a search.** Discovery is the point: the
  visitor meets works they would never have typed the name of. The draw never
  shows the same work twice, across visits.
- **A gallery that remembers.** There is no backend, so what a visitor has
  seen is kept in the browser; it is what makes the draw non-repeating and the
  progress figure meaningful.

## Features

| Feature | Where | Minimum it covers |
| --- | --- | --- |
| Discover: one random artwork at a time, with its full record | `/discover` | — |
| Artwork record at its own address, with an invalid address handled | `/discover/<id>` | **Detail view** (REQ-02) |
| My Gallery: every artwork seen, in a grid or a list | `/gallery` | **List** (REQ-01) |
| Completion ring: share of the collection seen | `/gallery` | **Chart** (REQ-03) |
| Home page, not-found page, day and night modes | `/`, any unknown address | Navigation (REQ-04) |

**Discover.** Arriving on the screen draws an artwork at once, and a second one
is drawn behind it, so "Discover another" shows the next work without waiting
for the museum. The artwork's picture keeps the real proportions of the
object. The wall label beside it gives the title, set at one of four sizes
depending on its length, and the artist and date. Below them come the
essentials (medium, dimensions, surface area, where it is kept, collection)
and the artist. A folded section holds the full record: credit line, image
rights, accession details and the link to the museum's own page.
The next-artwork button is held shut for three seconds, so that each work is
looked at, and it says how long is left. Leaving for another screen and
coming back finds the same artwork: the run lives above the router.

**Artwork record at `/discover/<id>`.** Any artwork of the collection opens at
its own address, from the gallery or from a shared link. An address that is
not a number, an identifier the department does not hold, or a work the museum
serves no picture for each gives a clear message, a way to try again, and a
way back to My Gallery — never a blank page.

**My Gallery.** Every artwork revealed by Discover is kept, newest first, on
this visit and the next ones. They are shown in a grid at their real
proportions or in a list with a thumbnail, where each one is kept, and its
size. The layout chosen is remembered. Each card opens the artwork on Discover.
A visitor who has seen nothing yet is invited to start.

**Completion ring.** A ring at the top of My Gallery shows the share of
European Paintings already seen, how many works are left, and the total it is
measured against. The ring uses the shadcn/ui donut-with-text chart, and the
line beside it states the sample: the 2,650 records of the department.

**Everywhere.**

- **Day and night modes, Sand and Cocoa.** Each is one palette with its roles
  swapped. The mode chosen is pinned before the first paint, so it never
  flashes.
- **Visible states.** Loading, error and empty states are always shown, with a
  retry where one makes sense.
- **Navigation.** The bar marks the current screen, and an unknown address
  gets a not-found page that leads home.
- **Layout and accessibility.** One breakpoint, at 761 px, for phones.
  Keyboard focus is visible, controls are at least 44 px, and every picture's text
  alternative is built from its artist, title and date.

## Quick start

### With Docker

The only requirement is Docker with the Compose plugin. One command starts the
development server:

```bash
docker compose up
```

Then open <http://localhost:5173>. Edits to the sources are picked up live
through hot module replacement.

If another project on your machine already holds port 5173, copy `.env.example`
to `.env` and change `MUSEUM_WEB_PORT`.

Two further services are available behind Compose profiles:

```bash
docker compose run --rm checks              # lint, type-check and test in a container
docker compose --profile production up      # production build served by nginx on :8080
```

The production image builds the application and serves `dist/` with nginx, which
falls back to `index.html` so that any client-side route can be opened directly.

Compose mounts only the source directories, not the whole tree, so the
`node_modules` installed inside the image is never shadowed by a volume that
could hold stale packages. After changing a dependency in `package.json`, rebuild
so that the install runs again:

```bash
docker compose up --build
```

### Without Docker

Requirements:

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 24.22.1 | pinned in `.nvmrc`; run `nvm use` to select it |
| pnpm | 10.15.1 | pinned in `package.json` via `packageManager`; `corepack enable pnpm` provides it |

TypeScript is pinned to 6.0.3 rather than 7, because `typescript-eslint` 8 still
declares `typescript <6.1.0` as a peer dependency and a newer compiler would make
`pnpm install` report an unmet peer.

```bash
nvm use                 # selects the Node version from .nvmrc
corepack enable pnpm    # once per Node installation
pnpm install            # install dependencies from pnpm-lock.yaml
pnpm dev                # start the development server
```

The development server prints its address; by default it is
<http://localhost:5173>.

Other commands:

```bash
pnpm build       # type-check the project, then build for production into dist/
pnpm preview     # serve the production build locally
pnpm lint        # run ESLint over the whole project
pnpm typecheck   # run the TypeScript compiler without emitting output
pnpm test        # run the unit and component tests once
pnpm test:watch  # run the tests in watch mode while developing
```

## Architecture

```text
.
├── index.html                        # entry document, mounts the app in #root and pins the saved mode
├── Dockerfile                        # multi-stage: development, checks, build, production
├── compose.yaml                      # services: web (default), checks, production
├── .env.example                      # overridable host ports for Compose
├── docker
│   └── nginx.conf                    # static server with client-side route fallback
├── components.json                   # shadcn/ui registry configuration
├── docs
│   └── DESIGN_SYSTEM.md              # the Sand / Cocoa design system reference
├── public
│   └── favicon.svg                   # the logotype mark, following the browser's colour scheme
├── vite.config.ts                    # Vite plugins (React, Tailwind), @ alias and Vitest setup
├── eslint.config.js                  # ESLint flat config, React Hooks rules enabled
├── tsconfig.json                     # project references and the @ path alias
├── tsconfig.app.json                 # TypeScript options for the application sources
├── tsconfig.node.json                # TypeScript options for the build tooling
└── src
    ├── main.tsx                      # React entry point: providers, router, <App />
    ├── App.tsx                       # page shell and routes
    ├── index.css                     # stylesheet entry point: Tailwind, fonts, tokens
    ├── styles
    │   ├── design-tokens.css         # colour, type, spacing, radii tokens and the two modes
    │   └── shadcn-tokens.css         # maps shadcn/ui variable names onto those tokens
    ├── api                           # the only layer that calls fetch
    │   ├── metMuseumEndpoints.ts     # every URL of the collection API
    │   ├── metMuseumErrors.ts        # one error type per way a call can fail
    │   ├── requestQueue.ts           # spaces the calls, to stay under the IP block
    │   ├── responseCache.ts          # one answer per URL, with in-flight sharing
    │   ├── metMuseumClient.ts        # GET as JSON: status, queue, cache, abort
    │   └── metMuseumObjects.ts       # the two object endpoints, read through the client
    ├── domain                        # pure model: no React, no fetch
    │   ├── artwork.ts                # type Artwork and the mapper from the payload
    │   ├── artworkFacts.ts           # the rows and blocks of the record
    │   ├── artworkTitleScale.ts      # which step a title is set at, by its length
    │   ├── artworkDraw.ts            # drawing one identifier at random
    │   ├── collectionError.ts        # what to tell a visitor about a refusal
    │   ├── discoveryCollection.ts    # department 11, the collection Discover draws from
    │   ├── discoveryProgress.ts      # how much of it has been seen, and its figures
    │   ├── discoveryRoute.ts         # /discover/<id>, the address an artwork opens at
    │   ├── seenArtwork.ts            # what My Gallery keeps of an artwork once seen
    │   └── themeModes.ts             # the Sand / Cocoa modes and their storage key
    ├── hooks                         # React state, held above the router
    │   ├── DiscoveryProvider.tsx     # the discovery run: one shown, one held ahead
    │   ├── DiscoveryContext.ts       # the shape of that run
    │   ├── useDiscovery.ts           # reads the run
    │   ├── drawRandomArtwork.ts      # one draw, skipping the objects with no picture
    │   ├── fetchDiscoveryArtwork.ts  # one named artwork of the collection, opened on Discover
    │   ├── useArtworkContemplation.ts # the three seconds an artwork is given
    │   ├── seenArtworksStorage.ts    # keeps the artworks seen in the browser
    │   ├── useDiscoveryCollectionSize.ts # how many artworks Discover can draw from
    │   ├── ThemeProvider.tsx         # resolves the mode, writes data-theme, persists it
    │   ├── ThemeContext.ts           # React context holding the current mode
    │   └── useTheme.ts               # reads the mode
    ├── pages                         # one screen per route
    │   ├── HomePage.tsx              # the bento landing page
    │   ├── DiscoverPage.tsx          # one artwork at a time, with its record; /discover/<id> too
    │   ├── GalleryPage.tsx           # My Gallery: progress ring, then every artwork seen
    │   └── NotFoundPage.tsx          # unknown address, with the way home
    ├── components                    # presentation only: props in, nothing else
    │   ├── brand                     # the logotype, and the logotype as a link home
    │   ├── layout                    # header, navigation, footer, bento, notice, boundary
    │   ├── theme                     # the day / night switch
    │   ├── landing                   # headline block, action tile, closing banner
    │   ├── artwork                   # artwork card and artwork image
    │   ├── discover                  # stage, wall label, fact section, next-artwork band
    │   ├── statistics                # the completion ring
    │   ├── gallery                   # layout switch, grid, list, lazily loaded pictures, links to Discover
    │   ├── icons                     # the seven icons of the system
    │   └── ui                        # button, badge, artwork year, shadcn/ui chart
    ├── lib
    │   └── utils.ts                  # re-exports the cn() class-name helper
    └── test
        ├── artworkFixture.ts         # the artwork the tests are written against
        ├── intersectionObserverStub.ts # brings an element into view by hand
        └── setupTestingLibrary.ts    # jest-dom matchers, DOM cleanup, matchMedia stub
```

Modules are imported through the `@` alias, which points at `src`: `@/lib/utils`
rather than a chain of relative segments. It is declared once in
`tsconfig.json` and once in `vite.config.ts`, so the compiler, the bundler and
the test runner all resolve it.

The four layers only ever depend downwards — `pages/` reads `hooks/`, which
reads `domain/`, which reads `api/` — and `components/` sits outside that
chain: it takes props and nothing else, which is why the display mode and the
discovery run are read in `App.tsx` and handed down rather than reached for
from inside a component.

Both React contexts are created with `null` as their default and their hooks
throw when they are used outside their provider, instead of handing out a
default value of the right shape. A provider missing from the tree is a
programming mistake, and a named error caught by the boundary says so, where a
half-state would fail somewhere else and later.

### AI-assisted Design system

The interface follows the **Sand / Cocoa** design system, described in
[`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md): a warm, gallery-wall palette
where the artworks are the only source of vivid colour, a single terracotta
accent for the main action, and two modes that are one palette with its roles
swapped rather than two separate themes. The tokens are the only way a component
reaches a colour, a type style or a radius.

### Technical choices

- **Vite** as the build tool, with **pnpm** as the package manager. Vite provides
  the transpiler, bundler and hot-reloading development server the project needs;
  `create-react-app`, the usual alternative, is no longer maintained.
- **TypeScript** rather than plain JavaScript. The API returns objects with many
  optional fields, and static types force every absent value to be handled at the
  call site. TypeScript is pinned to 6.0.3, the latest release supported by
  `typescript-eslint`.
- **shadcn/ui** on the Radix UI base for the component layer, on top of
  **Tailwind CSS** through the official Vite plugin. shadcn/ui was chosen because
  it is a component library that also provides the chart component, so the
  interface and the visualisations come from one system with one theme instead of
  two unrelated dependencies. shadcn/ui is not a
  runtime dependency that ships a design system: its CLI copies each component's
  source into `src/components/ui`, so only the components actually used exist in
  the repository and they can be edited like any other file here. That directory
  appears with the first component that needs it, rather than being created empty
  in advance. Structural containers also carry an explicit semantic class name
  alongside the utility classes, so that the rendered DOM stays readable.
  `src/styles/shadcn-tokens.css` maps shadcn/ui's own variable names onto the
  design system tokens, so every component copied in lands inside the palette in
  both modes without its source being touched.
- **Charts** come from the shadcn/ui `Chart` component, which wraps Recharts and
  reads the same theme variables (`--chart-1` to `--chart-5`) as the rest of the
  interface; each of those five is an existing design system token, so a chart
  follows the current mode and introduces no colour of its own. Recharts is
  the heaviest dependency in the project — measured at 104 kB gzipped against the
  108 kB of everything else — so the screen that draws the chart is loaded with
  `React.lazy`: the first screen never waits for it, and the shell fetches it in
  the background once that screen is idle, so opening My Gallery does not wait
  for it either. The last known size of the collection is kept in the browser,
  so the gallery's ring is drawn on arrival rather than after the two seconds
  the museum takes to send the identifier list.
- **ESLint** with `eslint-plugin-react-hooks`: `rules-of-hooks` is an error and
  `exhaustive-deps` is a warning, which catches effects with incomplete
  dependency arrays.
- **Vitest** with **React Testing Library** in a jsdom environment, so that
  components are queried the way a user would read them.
- **Docker** with a multi-stage image. The `development` stage runs the Vite dev
  server and relies on the sources being bind-mounted by Compose, so it carries
  no copy of them; `checks` runs the linter, the compiler and the tests;
  `production` builds the application and hands `dist/` to nginx. Dependencies
  are installed in their own layer, so editing a source file does not invalidate
  the install cache. Inside a container the file watcher polls, because
  bind-mounted files do not emit reliable filesystem events on macOS or Windows.
  Compose mounts the source directories individually rather than the project
  root: a named volume for `node_modules` would keep packages that have since
  been removed from `package.json`, because Docker only seeds such a volume
  while it is empty.

## Challenges

### The museum blocks a client that asks too often — and sometimes just stops answering

The API documents 80 requests per second. Measured, about 140 calls in a few
minutes earn a 403 on every endpoint for roughly five minutes, and under
heavier use it also leaves requests hanging: on 2026-11-19, three object reads
out of four were still unanswered after 30 seconds, while the identifier list
answered in 2. A screen waiting on such a call would say "loading" forever.

How it was solved, in `src/api/`:

- **Spaced calls.** Every call goes through one queue that spaces their
  *starts* 400 ms apart. It does not wait for a call to finish before starting
  the next. A first version did, and one hanging request then held every call
  behind it: the next draw, the artwork a visitor asked to open.
- **A deadline.** Every call is given up after 20 seconds, response body
  included. It is reported as "the museum is not answering", with a retry.
- **A response cache keyed by URL.** It answers the identifier list from
  memory for an hour, an object for six hours, and holds at most 500 entries.
  Two simultaneous calls for one URL share a single request.
- **Abandoned calls cost nothing.** A screen that goes away abandons its wait.
  The request itself is dropped once *every* caller waiting on it has left,
  and a request dropped before its turn in the queue is never sent.
- **No call for an identifier that cannot exist.** An identifier is checked
  against the cached list of the department before `GET /objects/{id}` is
  addressed, so a bad address fails without spending a call.

### `v1/search` is gone, and `v1.1/search` cannot do what discovery needs

The assignment asks for `v1.1/search`, since `v1/search` was withdrawn on
1 October 2026. The application reads `GET /objects?departmentIds=11` and
`GET /objects/{id}` instead, for three measured reasons:

- **It needs the department's whole identifier list.** Drawing uniformly at
  random, and checking an address before calling the museum, both require it.
  `/objects` returns it in one call; `v1.1/search` returns at most 500
  identifiers per call, so the same list costs six.
- **`hasImages` does not say what the API will serve.** Cross-checked against
  the department's list, `v1.1/search?hasImages=true` reports 2,647 works with
  an image out of 2,650. Yet object 437107, Monet's *The Parc Monceau*, is in
  that set and has no picture at all in the API.
- **The two endpoints do not even agree on the department's size.** They
  report 2,650 and 2,722 works respectively.

### About one artwork in seven comes back without a picture

Fifteen percent of a random sample of department 11 came back with an empty
`primaryImage` and `primaryImageSmall`. The cause, measured on 30 works: the
museum photographs the works still under copyright but withholds their pictures
from the API. Every work of the sample that had a picture was in the public
domain, and the two without one were not.

The other two filters that could have helped do not work:

- **`isPublicDomain` is ignored.** The search endpoint accepts the filter and
  returns the same results without it.
- **The object payload's own `isOnView` flag is wrong.** It is false for
  objects that hang in a gallery, so the gallery number is the one signal the
  model keeps.

How it was solved: the draw reads the object and, if it has no picture, draws
again, up to five times. Reading it is the only reliable test. A rejected work
is in the response cache, so meeting it again costs nothing, and the draw
happens while the visitor is still reading the artwork on screen, so it is
invisible.

### Pictures are heavy, and a gallery can hold hundreds of them

- **The smaller of the two picture files.** The application shows
  `primaryImageSmall` and not `primaryImage`: on object 437937 the first is
  142 kB and the second 2.93 MB, twenty-one times heavier for a frame no taller
  than 620 px.
- **The next picture is already on its way.** On Discover, the artwork's own
  picture is requested first and eagerly (`fetchpriority="high"`). The picture
  of the artwork held behind it is preloaded while the first one is being
  read, so "Discover another" shows an artwork whose picture is already there.
- **The gallery only fetches what is near the screen.** Each picture is
  requested only once its card comes within about one row of the viewport, an
  `IntersectionObserver` with a 240 px margin, with the browser's own lazy
  loading on top. Until then its frame is drawn empty at its final size, so
  nothing moves when the picture arrives.
- **The gallery itself costs no call.** It keeps the seven fields its cards
  show, not the museum's thirty-field records. Every artwork ever seen fits in
  the browser's storage, and the gallery opens without asking the museum
  anything.

### The rest of the loading path

- **The chart library is split off.** Recharts weighs 100 kB gzipped against
  110 kB for the rest of the application, so the gallery's screen is loaded
  with `React.lazy`. The first screen never waits for it. Once that screen is
  idle, the shell fetches the gallery's chunk in the background
  (`requestIdleCallback`, with a 3-second deadline), so opening My Gallery does
  not wait for it either.
- **Connections are opened early.** `index.html` preconnects to the API and to
  the image server, so the first call and the first picture do not pay for the
  connection setup.
- **What changes rarely is kept in the browser.** Four things live in
  `localStorage`, every access guarded so that a private window or blocked
  storage only loses the convenience:
  - the artworks seen (`museum:seen-artworks`);
  - the size of the collection (`museum:discovery-collection-size`), so the
    ring is drawn on arrival rather than after the two seconds the identifier
    list takes;
  - the gallery layout (`museum:gallery-layout`);
  - the colour mode (`museum:theme-mode`).
- **Nothing is drawn before it is needed.** Opening the application spends no
  call: the first draw happens when the visitor arrives on Discover, not when
  the application starts.

## AI usage

This project was built with the assistance of an AI coding tool (Claude Code).
The declaration below is deliberately exhaustive: everything the tool produced is
listed, including the parts of this README.

| Area | What the AI did | What I did |
| --- | --- | --- |
| Technical choices | Presented options, measured trade-offs and recommended | **Decided**: React, Vite, Vitest, and shadcn/ui for the component layer and the charts. Rejected MUI to avoid two styling engines |
| Project setup | Scaffolded the Vite application, wired every dependency, pinned the Node and pnpm versions, removed the generated demo files | Reviewed the result, asked for pnpm and for Node to be selected through nvm |
| Tooling configuration | Wrote the ESLint flat config, the Vitest setup, the `@` path alias, and pinned TypeScript to 6.0.3 after finding an incompatible peer dependency | Reviewed |
| Docker | Wrote the multi-stage `Dockerfile`, `compose.yaml`, the nginx configuration and the `.dockerignore`; ran and verified the three services | Asked for `docker compose up` to start everything; supplied the port constraints of my machine |
| Documentation | Drafted this README and keeps it in step with the repository: whenever something is added or changed, it updates the file tree, the affected sections, the technical choices and this very table as part of the same piece of work | Reviewed, corrected the scope of this very section, and ask for the declaration to stay exhaustive |
| API exploration | Measured field fill rates across six departments and found three traps: the object payload's `isOnView` field is wrong, the `isPublicDomain` search filter is ignored, and the real rate limit is an IP block rather than the documented 80 requests per second | Reviewed the findings and chose what to keep |
| Bug fixing | Found and fixed its own defects: a `node_modules` volume that retained removed packages, duplicate `Cache-Control` headers, a deprecated `baseUrl`, three unused dependencies, a leftover placeholder favicon, and a flash of the wrong colour mode on every reload | Reviewed, and reported the colour mode flash |
| Design system | Wrote the specification under my direction, then installed it: the tokens, the two modes, the type scale, the logotype and favicon, the first components and `docs/DESIGN_SYSTEM.md` | **Decided** the visual direction and the constraints it had to satisfy; chose the terracotta accent pair; reviewed the result in both modes |
| Collection API layer | Wrote the four layers that read the museum — URL builder, error types, request queue, response cache with in-flight sharing and abort, and the two object endpoints — with their tests, after measuring that the real limit is an IP block around 140 calls rather than the documented 80 requests per second | **Decided** to read `GET /objects` and chain `GET /objects/{objectID}` behind it so a detail call is only ever made with a valid identifier; reviewed the caching and the spacing |
| Discover screen | Implemented the screen from my own design canvas: the run held above the router, one artwork shown and one held ahead, the random draw that skips the 15 % of objects the museum has never photographed, the artwork-title scale, the three-second pause on the action, and the tests | **Decided** the concept and the layout, drew both artboards, reported the two cases where no image appeared, and asked for the artwork to survive leaving the screen and coming back |
| My Gallery | Kept every artwork Discover reveals in the browser's storage, wrote the completion ring with the shadcn/ui donut-with-text, the grid and list views, the pictures loaded only as they come into view, the opening of a seen artwork on Discover at `/discover/<id>`, and their tests, to the measures of my mockup; two agents worked in parallel on the last changes, one on the card and one on the opening | **Decided** that the gallery keeps every artwork seen, that the ring shows the share of European Paintings seen, and that it loads lazily; sent two earlier versions — a chart of the museum by department — back because they did not follow the mockup |
| Code review | Reviews each component it writes against the two references it must follow — `docs/DESIGN_SYSTEM.md` and the React practices document — and reports every raw colour, off-scale spacing, accessibility slip and rule violation, so that files written at different moments stay harmonised | Asked for that review to run on every interface change before a commit; decided which findings to apply |

Three guidance documents used while building the project are kept outside the
repository: one on the assignment and one on React practices, both produced with
AI assistance from the course material, and the design system specification.
That last one was written with AI assistance from my own direction: I set the
concept, the palette and the constraints, and the tool wrote them up as a
complete, exhaustive specification. It describes a French gallery site, so only
its visual system was carried over here; its wording and its language were not,
because everything in this repository is in English. `docs/DESIGN_SYSTEM.md` is
the English reference the tool derived from it, limited to what the project
actually uses.

TypeScript and Tailwind CSS were the tool's recommendations, which I accepted;
every other technical decision in the table above was mine.

## Testing

Component and unit tests run with Vitest in a simulated DOM:

```bash
pnpm test
```

Tests live next to the code they cover, named `*.test.tsx`, and query the
rendered output by role and accessible name rather than by internal structure.
