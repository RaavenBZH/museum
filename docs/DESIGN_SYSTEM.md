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
| `--color-surface-muted` | secondary button, badge container, image ground        | `#F1E8DE` | `#3A2920` |
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
| `text-caption-short` | 14 px   | 14 px  | 600             | 1.3         | 0          | navigation links                   |
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
| `rounded-pill`   | 999 px | buttons, navigation, badges                           |
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

No other icon library, no filled icon, no emoji. They are coded as
[`ArrowRightIcon`](../src/components/icons/ArrowRightIcon.tsx) and
[`ArrowUpRightIcon`](../src/components/icons/ArrowUpRightIcon.tsx), both
decorative: the control they sit in always carries its own label.

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

Built, with their tests beside them:

| Component                  | File                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `BrandLogo`                | [`src/components/brand/BrandLogo.tsx`](../src/components/brand/BrandLogo.tsx)               |
| `Button`, `ButtonLink`     | [`src/components/ui/Button.tsx`](../src/components/ui/Button.tsx)                           |
| `Badge`                    | [`src/components/ui/Badge.tsx`](../src/components/ui/Badge.tsx)                             |
| `DatePill`                 | [`src/components/ui/DatePill.tsx`](../src/components/ui/DatePill.tsx)                       |
| `ThemeToggleButton`        | [`src/components/theme/ThemeToggleButton.tsx`](../src/components/theme/ThemeToggleButton.tsx) |
| `AppHeader`, `AppFooter`   | [`src/components/layout/`](../src/components/layout/)                                       |
| `MainNavigation`           | [`src/components/layout/MainNavigation.tsx`](../src/components/layout/MainNavigation.tsx)   |
| `BentoGrid`                | [`src/components/layout/BentoGrid.tsx`](../src/components/layout/BentoGrid.tsx)             |
| `ArtworkCard`, `ArtworkImage` | [`src/components/artwork/`](../src/components/artwork/)                                  |
| `HeadlineBlock`, `ActionTile`, `ClosingBanner` | [`src/components/landing/`](../src/components/landing/)                 |

They are presentation components: they take props and nothing else, so they
hold no state and know nothing of the collection API. The screens that compose
them arrive with the features that need them.

The bar carries the three modes, in this order: **Discover**, **My Gallery**,
**Play**. Discover is the home itself — the page where artworks are read one
after another, at the reader's own pace — so the home has a current item, and
the logotype and the first link lead to the same place. Play is the timed
counterpart; it was called Timeline while it was only a mechanic, which named
how it works rather than what it offers.

The first of those screens is the home page,
[`src/pages/HomePage.tsx`](../src/pages/HomePage.tsx): the bar, the bento grid
and the closing band. Its seven artworks are a fixed editorial selection
([`homeFeaturedArtworks.ts`](../src/pages/homeFeaturedArtworks.ts)), not an API
result — the door of the product opens on the same composed grid every time,
and the collection is drawn at random in Discovery mode instead. Each tile
links to `/artworks/<objectID>`, the detail view of a real object.

### Buttons

All four share one shell: `inline-flex`, at least 56 px tall, `rounded-pill`,
`text-button`, label centred.

| Variant     | Background             | Text                   | Padding | Weight | Arrow |
| ----------- | ---------------------- | ---------------------- | ------- | ------ | ----- |
| `primary`   | `--color-accent`       | `--color-on-accent`    | 28 px   | 600    | yes   |
| `secondary` | `--color-surface-muted`| `--color-text`         | 24 px   | 500    | no    |
| `inverse`   | `--color-inverse-text` | `--color-inverse-bg`   | 28 px   | 600    | yes   |
| `text`      | none                   | `--color-text`         | 16 px   | 500    | no    |

The `text` variant is the quietest of the four and the only one with no
surface: it is for an action that must stay reachable without competing with
anything around it. It keeps the shell, so its height and its focus ring match
the others, and it softens to `--color-text-muted` on hover, like every other
link-like thing in the system.

The `variant` prop is required on both `Button` and `ButtonLink`: a button
whose weight is implicit is a button nobody checked. The inverse variant takes
its container's text colour as its background and its background as its text,
and is used inside an inverted block only. A screen area carries at most one
primary button, labelled **Discover**.

`Button` renders a `<button type="button">` and acts on the current page;
`ButtonLink` renders an `<a>` and takes the visitor elsewhere, so it keeps the
keyboard behaviour, the context menu and the middle click of a real link. The
arrow follows the label of the two strong variants and is hidden from assistive
technology, since the label already names the action.

### Bento grid

The grid is the heart of the system, and the size of each cell reflects the
format of the artwork it holds.

```css
.bento {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: minmax(64px, auto);
  grid-auto-flow: dense;
  gap: 8px;
}
@media (width >= 761px) {
  .bento {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: minmax(72px, auto);
    gap: 12px;
  }
}
```

The row height is a floor, not a fixed value. The text in a tile comes from the
collection API or from a headline whose words may run long, and a fixed row
makes that text spill out of its tile, where the next tile paints over it. The
row grows instead: over-tall beats clipped.

`BentoGrid` writes this with the mobile layout as the base and `desktop:`
utilities above it, which is why no span has to be undone on mobile: a tile two
columns wide is half of the desktop grid and the whole of the mobile one, so
one class holds at both widths. The two row heights are the only raw lengths of
the system; they belong to the grid rather than to the palette of reusable
values.

| Artwork format                           | Columns × rows (desktop) |
| ---------------------------------------- | ------------------------ |
| Headline block (title + call to action)  | 2 × 6                    |
| Very large landscape (≥ 1.4:1)           | 2 × 4                    |
| Panoramic (≥ 2:1)                        | 2 × 3                    |
| Portrait (≤ 0.85:1)                      | 1 × 5                    |
| Small format or modest landscape         | 1 × 2                    |
| Action tile                              | 1 × 2                    |

A tile never writes its span by hand: it asks
[`bentoTileClassName`](../src/components/layout/bentoTileFormats.ts) for the
classes of its format, which keeps the table above the single place where the
mapping lives. The source order must let `dense` placement fill the grid
without holes.

### Artwork card

A `--color-surface` card with 10 px padding, `rounded-card`, holding a
`rounded-image` frame whose image is `object-fit: cover` — never distorted,
never letterboxed. The whole card is one link to the artwork's detail view.
The caption has **one** form, on every tile:

1. Title in `text-caption-title`, with the year aligned right on the same line.
2. Artist in `text-caption-meta`, `--color-text-muted`, on the line below.

Both lines are always there. A tile that dropped the title, or moved the artist
up a line because it was narrow, would make the same artwork read differently
depending on where the grid happened to place it — which is the one thing a
caption must not do. Retreats, type styles and order are therefore identical
across the four formats, and only three things answer to the width: a long
title wraps to two lines and stops (`line-clamp-2`), a long artist name is cut
with an ellipsis. Nothing else answers to the format.

**On a small tile the caption is two title lines tall, and what does not fit is
cut.** A one-line title leaves room for the artist; a title that takes both
lines pushes the artist exactly out of the box. The box is written as
`calc(2 × line-height × font-size + 4px)` against the `text-caption-title`
tokens rather than as a length, so the three heights of the caption — 19.5 px
for the title line, the 4 px gap, 18.2 px for the artist — are read from the
type scale and land at 41.7 px inside a 43 px box. Nothing is measured at
runtime, no half-line of text ever shows, and the artist stays in the markup,
so the link name and the alternative text still carry it.

**The title always wins the caption line.** The title takes the space left
over (`flex-1`), while the year is capped at 45 % of the line and cut with an
ellipsis beyond it. Without that cap a date the API returns as a sentence —
"second half 19th century" — would set the line width on its own and squeeze
the title down to a letter or two. A year that has to be cut is a sign the
wrong field was passed: `objectDate` is shown when it reads as a date, and
`objectBeginDate` takes over when it is missing or is a sentence.

The caption carries the **year**, not the dimensions: the collection API
returns `dimensions` as free text ("36 1/4 × 28 3/4 in.") and cannot feed
`91 × 73.5 cm`, while `objectBeginDate` is filled on every artwork measured.

`ArtworkImage` takes a nullable source, because about six artworks in a hundred
come back without a picture: that is a normal state, and the fallback says so
in words on a `--color-surface-muted` ground. Alternative text follows
`Firstname Lastname, Title, year`. Only public-domain artworks, or artworks
whose rights are cleared, are displayed.

### Header

Three columns — `minmax(0, 1fr) auto minmax(0, 1fr)` — not a `space-between`
row: the logotype on the left, the navigation in the middle, one action on the
right. The side columns stay equal whatever they hold, so the navigation sits
on the axis of the page and not on the centre of the space left over between
two slots of very different widths, which put it about 60 px off.

The right-hand action is **Settings**, a `text` button labelled with the word:
it is a way out of the page, not a step forward in it, so it carries no
surface. The mockup had a sign-in button there; the application has no account
and no server, so there is nothing to sign in to, and the slot carries the one
thing a reader can actually change — their preferences, the display mode among
them. That is also where the mode switch belongs once the screen exists; until
then it is shown in the component gallery rather than in the bar.

### Texture on the inverted surfaces

The two flat inverted surfaces — the action tile and the closing band — may
carry an artwork behind them, under a veil of **`--color-inverse-bg` at 90 %**.
The veil is the surface's own colour, so it follows the mode: it darkens in
Sand and lightens in Cocoa, and the text above keeps the same contrast in
both. This is the one place a picture appears without being the subject, which
is why it is called a texture, carries no alternative text and is hidden from
assistive technology. It is not a decoration the system otherwise allows: there
is still no shadow, no border, no gradient and no blur.

The artwork used as texture is never one already shown as a tile on the same
screen — the same picture read twice would look like a mistake rather than a
motif — and it is chosen for its surface rather than its scene, since the grain
is the only thing that survives a veil. The texture grows by 5 % on hover like
any other picture, while the veil stays put, so nothing above it moves.

### Hover

The system has no shadow, no border and no glow, so a hovered thing answers
with the two means it does have: its surface, and the arrow it already
carries.

| Resting                 | Hovered                       |
| ----------------------- | ----------------------------- |
| `--color-accent`        | `--color-accent-hover`        |
| `--color-surface-muted` | `--color-surface-muted-hover` |
| `--color-inverse-text`  | `--color-inverse-text-hover`  |

Each hover colour is one step of the same hue, never a new one: darker in
Sand, lighter in Cocoa, so that in both modes a hovered button moves *away*
from the page behind it. The `text` button is the exception — it has no
surface at rest and gains `--color-surface-muted` on hover, which is the same
idea read the other way round.

Two things move, and both only under `motion-safe`, so a reader who has asked
the system for less motion keeps the colour change and loses nothing that
carries meaning:

- **The arrows slide 2 px the way they point** — the right arrow sideways, the
  diagonal arrow up and across. The button is a `group`, so the arrow answers
  the hover of the whole button rather than of itself.
- **An artwork picture grows by 5 %** when its card is hovered, caption
  included: the whole card is one link, so the whole card is one target. The
  frame keeps `overflow: hidden`, so the artwork is cropped a little further
  instead of spilling, and nothing in the grid reflows. The missing-picture
  fallback does not move — there is nothing to look closer at.

### Navigation bar

A `rounded-pill` container on `--color-surface` with 4 px padding and 4 px
between links. Each link is at least 40 px tall with 16 px of horizontal
padding, in 14 px / 500. The current link takes `--color-inverse-bg` and
`--color-inverse-text`, **and** `aria-current="page"`, so the mark does not
rest on colour alone. Hidden below 761 px. Carries
`aria-label="Main navigation"`.

### Other components

- **Badge**: a `--color-surface-muted` pill (padding 6 px 12 px 6 px 6 px,
  13 px / 500) containing an accent pill (3 px 8 px, 12 px), 8 px apart.
- **Date**: `text-mono` on `--color-text-muted`, with no surface and no
  padding of its own, identical on all four artwork formats. It wore a
  `--color-surface-muted` pill on the two-column tiles until 2026-11-10; the
  surface was dropped because the same field then read as a label on the wide
  tiles and as plain text on the narrow ones, and a grid of cards cannot carry
  that difference. A surface is for something that really is a label, which is
  `Badge`.
- **Action tile**: a link the size of a 1 × 2 cell, inverted, 22 px padding,
  `space-between`. Counter in `text-mono` `--color-inverse-muted` top left,
  a 40 px accent circle holding the diagonal arrow top right, label in
  `text-tile-title` at the bottom. The counter is optional and is left out
  rather than guessed; the arrow then keeps the right-hand side on its own.
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
