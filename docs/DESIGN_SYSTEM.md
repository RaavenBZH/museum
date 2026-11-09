# Design system — Sand / Cocoa

The interface stays in a range of warm browns and creams, like a gallery wall,
so that the artworks are the only source of vivid colour on screen. A single
terracotta accent points at the main action.

The two modes are not two themes but two faces of one material: the same hues
circulate between them and swap roles. Light text *is* the dark background,
light cards take the colour of dark text, and the accent keeps its hue while
changing brightness. Only token values change between modes — never the layout,
the sizes or the radii.

Tokens live in [`src/styles/design-tokens.css`](../src/styles/design-tokens.css);
the shadcn/ui mapping lives in
[`src/styles/shadcn-tokens.css`](../src/styles/shadcn-tokens.css).

## Rules

1. Components reference semantic tokens only. Raw hex values appear nowhere but
   the token definitions.
2. No gradient, shadow, border, blur, texture or emoji. Depth comes only from
   the value gap between `bg`, `surface` and `surface-muted`.
3. No colour outside the palette below, including neutral greys, blues and pure
   black. Pure white is used in one place only: text on the accent in Sand mode.
4. No third typeface, and the monospace family never carries prose or a heading.
5. No radius other than 999, 32, 24 and 2 px.
6. One primary button per screen area at most.
7. Nothing is drawn on top of an artwork: no text, no tint, no filter. The
   caption always sits below the image, inside the card.
8. Colour is never the only carrier of information.

## Colour

| Semantic token          | Role                                                   | Sand      | Cocoa     |
| ----------------------- | ------------------------------------------------------ | --------- | --------- |
| `--color-bg`            | page background                                        | `#ECE3D9` | `#1E130E` |
| `--color-surface`       | cards, artwork tiles, navigation bar                   | `#FAF6F1` | `#2A1C15` |
| `--color-surface-muted` | dimension pills, secondary button, badge container     | `#F1E8DE` | `#3A2920` |
| `--color-text`          | body text, headings, links                             | `#1E130E` | `#FAF6F1` |
| `--color-text-muted`    | secondary text, captions, footer, link hover           | `#5E4A3E` | `#C9B4A5` |
| `--color-text-subtle`   | second line of a large headline, **24 px and up only** | `#9A8172` | `#9A8172` |
| `--color-accent`        | primary button, badge, arrow pill, logo marks           | `#B5482A` | `#E8714B` |
| `--color-on-accent`     | text and icons on the accent                           | `#FFFFFF` | `#1E130E` |
| `--color-inverse-bg`    | inverted blocks (action tile, closing banner, active tab) | `#1E130E` | `#ECE3D9` |
| `--color-inverse-text`  | text on `--color-inverse-bg`                           | `#FAF6F1` | `#1E130E` |
| `--color-inverse-muted` | secondary text on `--color-inverse-bg`                 | `#C4AE9F` | `#5E4A3E` |

`--color-text-subtle` reaches 3.39:1 on a Sand surface, which clears WCAG 2.1 AA
for large text but not for body text — hence the 24 px floor. Every other
combination in use clears 4.5:1; the lowest is `accent` on `surface` at 4.97:1.

An alternative accent may be adopted only as a complete pair, both modes at
once: Ochre `#9A5B2D` / `#D9A066`, Olive `#6B6A35` / `#B4B878`, Slate `#4E5F78`
/ `#93AFCF`. A light accent from one pair never goes with a dark accent from
another.

### Modes

`data-theme` on `<html>` is authoritative: `sand` or `cocoa` pins a mode, and
its absence follows the operating system. `ThemeProvider` owns the attribute and
remembers the visitor's choice; `dark:` utilities resolve the same way.

## Typography

`Inter Tight` for everything, `JetBrains Mono` for figures alone — artwork
dimensions and counters. Both are self-hosted through Fontsource, so a clean
clone needs no network access to render correctly.

Each style below is one Tailwind utility (`text-hero`, `text-caption-meta`…)
carrying size, line height, tracking and weight together.

| Utility              | Desktop | Mobile | Weight          | Line height | Tracking   | Use                                |
| -------------------- | ------- | ------ | --------------- | ----------- | ---------- | ---------------------------------- |
| `text-display`       | 72 px   | 44 px  | 600             | 0.95        | -0.05 em   | closing banner headline            |
| `text-hero`          | 68 px   | 44 px  | 600             | 0.95        | -0.045 em  | page headline (`h1`)               |
| `text-tile-title`    | 30 px   | 30 px  | 600             | 1           | -0.04 em   | label of the action tile           |
| `text-logo`          | 20 px   | 20 px  | 700             | 1           | -0.04 em   | logotype                           |
| `text-lead`          | 18 px   | 18 px  | 400             | 1.5         | 0          | introductory paragraph             |
| `text-button`        | 17 px   | 17 px  | 600 / 500       | 1           | 0          | button labels                      |
| `text-caption-title` | 15 px   | 15 px  | 600             | 1.3         | 0          | artwork title in a caption         |
| `text-caption-short` | 14 px   | 14 px  | 600             | 1.3         | 0          | artist name alone, navigation      |
| `text-caption-meta`  | 13 px   | 13 px  | 400–500         | 1.4         | 0          | artist and year, footer, badge     |
| `text-mono`          | 12 px   | 12 px  | 400             | 1.4         | 0          | dimensions, counters               |

Large headings always carry negative tracking: that is what gives the system its
character. A large heading without it is a mistake.

Headlines run over two lines, the first in `--color-text` and the second in
`--color-text-subtle`, and end with a full stop.

## Spacing, page shell and radii

Allowed spacing values, in pixels: **2, 3, 4, 6, 8, 10, 12, 16, 20, 22, 24, 28,
32, 40, 44, 56**. No margin, padding or gap uses anything else. Tailwind's
numeric scale expresses all of them (`gap-2` = 8 px, `p-5.5` = 22 px).

| Element            | Desktop            | Mobile (≤ 760 px) |
| ------------------ | ------------------ | ----------------- |
| Content width      | 1320 px, centred   | 100 %             |
| Side gutters       | 40 px              | 16 px             |
| Header             | 24 px vertical     | 24 px vertical    |
| Footer             | 32 px top, 40 px bottom | identical    |

`max-w-page` is the 1320 px container and `desktop:` is the system's single
breakpoint, above 760 px.

| Radius utility   | Value  | Use                                                   |
| ---------------- | ------ | ----------------------------------------------------- |
| `rounded-pill`   | 999 px | buttons, navigation, badges, dimension pills          |
| `rounded-card`   | 32 px  | cards, artwork tiles, action tile, banner             |
| `rounded-image`  | 24 px  | image inside a card (32 − 10 px padding, concentric)  |
| `rounded-mark`   | 2 px   | the small bars of the logo                            |

## Icons

Inline SVG at the stroke, `viewBox="0 0 24 24"`, `fill="none"`,
`stroke="currentColor"`, `stroke-width="2"`, round caps and joins,
`aria-hidden="true"` whenever a label is present. The system has exactly two:

| Icon           | Path                          | Use                              |
| -------------- | ----------------------------- | -------------------------------- |
| Right arrow    | `M5 12h14` + `M13 6l6 6-6 6`  | buttons, 18 px                   |
| Diagonal arrow | `M7 17L17 7` + `M8 7h9v9`     | action tile, 18 px inside 40 px  |

No other icon library, no filled icon, no emoji. Neither icon is coded yet:
both arrive with the component that needs them.

## Logotype

The mark is four bars on a 2 x 2 arrangement, 19 x 23 at its natural size: two
columns of 8 px bars set 3 px apart. The top-left and bottom-right bars stand
12 px tall in `--color-text`; the other two are 8 px in `--color-accent`. The
bottom-right bar is raised 4 px, so the two columns sit flush at the top and at
the bottom while their gaps fall at different heights. Corners use
`rounded-mark`. The mark is followed by the product name in `text-logo`, 10 px
away.

`public/favicon.svg` carries the same four rectangles, uniformly scaled into a
32 x 32 square. A favicon is its own document: it cannot read the page tokens,
so it repeats the palette as literal values and swaps them under
`prefers-color-scheme: dark`, which is the mirror rule applied to the browser's
own colour scheme rather than to the page's mode. Keep the two in step by hand
when the mark changes, and remember that a double hyphen cannot appear inside
an XML comment.

## Components

Built: `BrandLogo`, `Button`, `ThemeToggleButton`, `AppHeader`, `AppFooter`.

The specifications below are part of the system but are not coded yet: each one
arrives with the feature that needs it, so that the repository carries no unused
component.

### Buttons

All three share one shell: `inline-flex`, at least 56 px tall, `rounded-pill`,
`text-button`, label centred.

| Variant     | Background             | Text                   | Padding | Weight | Arrow |
| ----------- | ---------------------- | ---------------------- | ------- | ------ | ----- |
| `primary`   | `--color-accent`       | `--color-on-accent`    | 28 px   | 600    | yes   |
| `secondary` | `--color-surface-muted`| `--color-text`         | 24 px   | 500    | no    |
| `inverse`   | `--color-inverse-text` | `--color-inverse-bg`   | 28 px   | 600    | yes   |

Only `secondary` is coded, as `Button`, because it is the only one a screen
needs today. The inverse variant takes its container's text colour as its
background and its background as its text, and is used inside an inverted block
only. A screen area carries at most one primary button, labelled **Discover**.

### Bento grid

The grid is the heart of the system, and the size of each cell reflects the
format of the artwork it holds.

```css
.bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 72px;
  grid-auto-flow: dense;
  gap: 12px;
}
@media (max-width: 760px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: 64px;
    gap: 8px;
  }
  .bento > * { grid-column: span 1; }
  .bento > .bento__full-width { grid-column: span 2; }
}
```

| Artwork format                           | Columns × rows (desktop) |
| ---------------------------------------- | ------------------------ |
| Headline block (title + call to action)  | 2 × 6                    |
| Very large landscape (≥ 1.4:1)           | 2 × 4                    |
| Panoramic (≥ 2:1)                        | 2 × 3                    |
| Portrait (≤ 0.85:1)                      | 1 × 5                    |
| Small format or modest landscape         | 1 × 2                    |
| Action tile                              | 1 × 2                    |

Anything spanning two columns takes `bento__full-width` so it keeps the whole
width on mobile. The source order must let `dense` placement fill the grid
without holes.

### Artwork card

A `--color-surface` card with 10 px padding, `rounded-card`, holding a
`rounded-image` frame whose image is `object-fit: cover` — never distorted,
never letterboxed. The caption has three forms:

1. **Wide tile (2 columns)**, one line: title in `text-caption-title` followed
   by "— Artist, year" in `--color-text-muted`, and the dimension pill on the
   right.
2. **Portrait tile (1 × 5)**, two lines: title and dimensions on the first,
   "Firstname Lastname, year" in `text-caption-meta` on the second.
3. **Small tile (1 × 2)**, one line: artist name in `text-caption-short`, with
   the dimensions in `text-mono` on the right.

Alternative text follows `Firstname Lastname, Title, year`. Dimensions are
written height × width in centimetres, e.g. `91 × 73.5 cm`. Only public-domain
artworks, or artworks whose rights are cleared, are displayed.

### Navigation bar

A `rounded-pill` container on `--color-surface` with 4 px padding and 4 px
between links. Each link is at least 40 px tall with 16 px of horizontal
padding, in 14 px / 500. The active link takes `--color-inverse-bg` and
`--color-inverse-text`. Hidden below 760 px. Carries
`aria-label="Main navigation"`.

### Other components

- **Badge**: a `--color-surface-muted` pill (padding 6 px 12 px 6 px 6 px,
  13 px / 500) containing an accent pill (3 px 8 px, 12 px), 8 px apart.
- **Dimension pill**: `text-mono`, padding 4 px 10 px, `--color-surface-muted`,
  `rounded-pill`. Small tiles show the dimensions without the pill, in
  `--color-text-muted`.
- **Action tile**: a link the size of a 1 × 2 cell, inverted, 22 px padding,
  `space-between`. Counter in `text-mono` `--color-inverse-muted` top left,
  a 40 px accent circle holding the diagonal arrow top right, label in
  `text-tile-title` at the bottom.
- **Headline block**: a 2 × 6 surface card, 44 px padding, column
  `space-between` with a 24 px gap: badge, then headline + lead (max width
  480 px, 20 px apart), then a row of buttons 12 px apart.
- **Closing banner**: a full-width inverted section 12 px below the grid, 56 px
  padding, `rounded-card`, with a two-line `text-display` headline on the left
  and an inverse button aligned bottom right. The two stack and align left on
  mobile.

## Accessibility

Every clickable area measures at least 44 × 44 px. Interactive elements are real
`<a href>` or `<button>` elements, never clickable `<div>`s. An icon-only button
carries an `aria-label`. Focus is never removed: `:focus-visible` draws a 2 px
accent outline with a 2 px offset.

## Writing

Sober, direct and precise, descriptive rather than promotional. The main verb of
the product is **Discover**, optionally completed ("Discover by format"). Figures
and dimensions are always real: no invented statistics, prices or testimonials.
