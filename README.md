# Met Museum Explorer

A React single-page application built on the public
[Metropolitan Museum of Art collection API](https://metmuseum.github.io/).

## Overview

The Met publishes over 470 000 catalogued objects through an open API that needs
no key. This application browses that collection, shows a detailed record for a
single artwork, and charts how a set of artworks is distributed, so that a
visitor can both look at individual objects and get a sense of the collection as
a whole.

The application deliberately focuses on a narrow slice of the API and exploits
it thoroughly, rather than exposing every endpoint shallowly.

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
├── index.html                        # entry document, mounts the app in #root
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
    ├── main.tsx                      # React entry point, mounts <App /> in StrictMode
    ├── App.tsx                       # application root component and page shell
    ├── index.css                     # stylesheet entry point: Tailwind, fonts, tokens
    ├── styles
    │   ├── design-tokens.css         # colour, type, spacing, radii tokens and the two modes
    │   └── shadcn-tokens.css         # maps shadcn/ui variable names onto those tokens
    ├── components
    │   ├── brand
    │   │   └── BrandLogo.tsx         # the logotype: four-bar mark plus product name
    │   ├── layout
    │   │   ├── AppHeader.tsx         # logotype and mode switch
    │   │   └── AppFooter.tsx         # product name and data attribution
    │   ├── theme
    │   │   ├── themeModes.ts         # the Sand / Cocoa modes and their storage key
    │   │   ├── ThemeContext.ts       # React context holding the current mode
    │   │   ├── ThemeProvider.tsx     # resolves the mode, writes data-theme, persists it
    │   │   ├── useTheme.ts           # hook reading the theme context
    │   │   └── ThemeToggleButton.tsx # switches between the two modes
    │   └── ui
    │       └── Button.tsx            # the pill button on the muted surface
    ├── lib
    │   └── utils.ts                  # re-exports the cn() class-name helper
    └── test
        └── setupTestingLibrary.ts    # jest-dom matchers, DOM cleanup, matchMedia stub
```

Modules are imported through the `@` alias, which points at `src`: `@/lib/utils`
rather than a chain of relative segments. It is declared once in
`tsconfig.json` and once in `vite.config.ts`, so the compiler, the bundler and
the test runner all resolve it.

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
  follows the current mode and introduces no colour of its own. Recharts is the heaviest dependency in the project, so the chart
  view is loaded with `React.lazy`: the list and detail views stay at the base
  bundle weight and the chart code is fetched only when that view is opened.
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
| Bug fixing | Found and fixed its own defects: a `node_modules` volume that retained removed packages, duplicate `Cache-Control` headers, a deprecated `baseUrl`, three unused dependencies, a leftover placeholder favicon | Reviewed |
| Design system | Wrote the specification under my direction, then installed it: the tokens, the two modes, the type scale, the logotype and favicon, the first components and `docs/DESIGN_SYSTEM.md` | **Decided** the visual direction and the constraints it had to satisfy; chose the terracotta accent pair; reviewed the result in both modes |

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
