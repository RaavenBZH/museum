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
combination carrying text clears 4.5:1; the lowest is `accent` on `surface` at
4.97:1. `accent` on `--color-bg` reaches only 4.22:1 in Sand: it is a surface
colour at that pairing and never carries text. The 40 px accent circle of the
action tile sits on `--color-inverse-bg` at 3.40:1 in Sand and 2.40:1 in Cocoa;
it is ornament, not a control — the tile is the link, its label is worded and
the arrow inside is `aria-hidden` — so it is the one graphical object of the
system exempt from the 3:1 of WCAG 1.4.11.

An alternative accent may be adopted only as a complete pair, both modes at
once: Ochre `#9A5B2D` / `#D9A066`, Olive `#6B6A35` / `#B4B878`, Slate `#4E5F78`
/ `#93AFCF`. A light accent from one pair never goes with a dark accent from
another.


### Modes

`data-theme` on `<html>` is authoritative: `sand` or `cocoa` pins a mode, and
its absence follows the operating system. `ThemeProvider` owns the attribute and
remembers the visitor's choice; `dark:` utilities resolve the same way.

The attribute only exists once React has mounted, so a visitor whose saved mode
contradicts the system preference would see the other mode painted first. A
blocking script in `index.html` therefore sets the attribute from the saved
value before the first paint; it is the one place that repeats the storage key
and the mode names, because it runs before any module is loaded.

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
| `text-headline`      | 44 px   | 30 px  | 600             | 0.95        | -0.045 em  | My Gallery headline, ring figure   |
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

### Artwork title

The title of an artwork is the one style whose size is chosen from the content
rather than from the element. The museum's titles run from two words ("In the
Sun") to a paragraph naming the sitter, their rank and their dates, and they
are set in a column of fixed width: one size would either dwarf the short ones
or let the long ones take the whole wall label.

So it has a scale of its own, in four steps, picked by title length. The
breakpoints are **lengths in characters**, not viewport widths. Measured on 24
artworks drawn at random from European Paintings, the titles were 10 to 24
characters for 10 of them, up to 40 for 8 more, up to 80 for 4, and one
reached 167; the steps below cut that spread at **24, 48 and 90**.

| Utility                  | Title length    | Desktop | Mobile | Line height | Tracking   |
| ------------------------ | --------------- | ------- | ------ | ----------- | ---------- |
| `text-artwork-title-xl`  | up to 24 chars  | 44 px   | 36 px  | 1           | -0.04 em   |
| `text-artwork-title-l`   | 25 – 48         | 36 px   | 30 px  | 1.05        | -0.035 em  |
| `text-artwork-title-m`   | 49 – 90         | 28 px   | 24 px  | 1.15        | -0.025 em  |
| `text-artwork-title-s`   | beyond 90       | 22 px   | 20 px  | 1.25        | -0.015 em  |

All four are weight 600. The line height grows and the tracking loosens as the
size drops: a long title is read as text, a short one as a headline. The step
is decided by `artworkTitleScale` in the domain layer, so the decision is one
pure function with its own tests, and the component only maps a step to a
utility.

The names of this scale are declared to the class merger in
[`src/lib/utils.ts`](../src/lib/utils.ts). Without that list it reads
`text-caption-short` as a colour and drops it as soon as the same element also
sets `text-inverse-text`, which leaves the element at the inherited size: add
every new `--text-*` token there.

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
`aria-hidden="true"` whenever a label is present. The system has exactly seven:

| Icon           | Path                          | Use                              |
| -------------- | ----------------------------- | -------------------------------- |
| Right arrow    | `M5 12h14` + `M13 6l6 6-6 6`  | buttons, 18 px                   |
| Diagonal arrow | `M7 17L17 7` + `M8 7h9v9`     | action tile, 18 px inside 40 px  |
| Sun            | `r="4"` circle + eight rays   | mode switch, 18 px inside 44 px  |
| Crescent       | `M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z` | mode switch, 18 px inside 44 px |
| Chevron        | `M6 9l6 6 6-6` down, `M18 15l-6-6-6 6` up | disclosure button, 18 px         |
| Grid           | four 7 × 7 squares            | layout switch, 18 px             |
| List           | three ruled lines and their bullets | layout switch, 18 px       |

No other icon library, no filled icon, no emoji. They are coded as
[`ArrowRightIcon`](../src/components/icons/ArrowRightIcon.tsx),
[`ArrowUpRightIcon`](../src/components/icons/ArrowUpRightIcon.tsx),
[`SunIcon`](../src/components/icons/SunIcon.tsx),
[`MoonIcon`](../src/components/icons/MoonIcon.tsx),
[`ChevronIcon`](../src/components/icons/ChevronIcon.tsx),
[`GridIcon`](../src/components/icons/GridIcon.tsx) and
[`ListIcon`](../src/components/icons/ListIcon.tsx), all seven decorative:
the control they sit in always carries its own label. The two arrows slide 2 px
the way they point on hover, under a `motion-safe` guard; the sun, the crescent,
the chevron, the grid and the list never move — what is behind or beside them is what tells the
state. The chevron points down on what is folded and up on what is open, so it
states the state rather than the action, and `aria-expanded` says it again.

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
| `BrandLogo`, `BrandLogoLink` | [`src/components/brand/BrandLogo.tsx`](../src/components/brand/BrandLogo.tsx)             |
| `Button`, `ButtonLink`, `ButtonRouterLink` | [`src/components/ui/Button.tsx`](../src/components/ui/Button.tsx)           |
| `Badge`                    | [`src/components/ui/Badge.tsx`](../src/components/ui/Badge.tsx)                             |
| `ArtworkYear`              | [`src/components/ui/ArtworkYear.tsx`](../src/components/ui/ArtworkYear.tsx)                 |
| `ThemeModeSwitch`          | [`src/components/theme/ThemeModeSwitch.tsx`](../src/components/theme/ThemeModeSwitch.tsx)   |
| `AppHeader`, `AppFooter`   | [`src/components/layout/`](../src/components/layout/)                                       |
| `MainNavigation`           | [`src/components/layout/MainNavigation.tsx`](../src/components/layout/MainNavigation.tsx)   |
| `BentoGrid`                | [`src/components/layout/BentoGrid.tsx`](../src/components/layout/BentoGrid.tsx)             |
| `ArtworkCard`, `ArtworkImage` | [`src/components/artwork/`](../src/components/artwork/)                                  |
| `HeadlineBlock`, `ActionTile`, `ClosingBanner` | [`src/components/landing/`](../src/components/landing/)                 |
| `ArtworkStage`, `ArtworkWallLabel`, `ArtworkFactSection`, `NextArtworkBar` | [`src/components/discover/`](../src/components/discover/) |
| `NoticePanel`, `ErrorBoundary` | [`src/components/layout/`](../src/components/layout/)                                   |
| `GalleryInsights`, `CenturyComparisonChart`, `MediumPieChart` | [`src/components/gallery/`](../src/components/gallery/), [`src/components/statistics/`](../src/components/statistics/) |
| `CompletionDonutChart`     | [`src/components/statistics/CompletionDonutChart.tsx`](../src/components/statistics/CompletionDonutChart.tsx) |
| `GalleryLayoutSwitch`, `GalleryCollectionGroup`, `SeenArtworkGrid`, `SeenArtworkList`, `SeenArtworkPicture` | [`src/components/gallery/`](../src/components/gallery/) |
| `ChartContainer`, `ChartTooltip` (vendored from shadcn/ui) | [`src/components/ui/chart.tsx`](../src/components/ui/chart.tsx) |

The mode itself is not a component: `ThemeProvider`, `ThemeContext` and
`useTheme` live in [`src/hooks/`](../src/hooks/) and the modes themselves in
[`src/domain/themeModes.ts`](../src/domain/themeModes.ts), because everything
under `components/` is presentation without state. `ThemeModeSwitch` takes the
mode on screen as a prop and hands the choice back as a call.

The textures of the inverted blocks are listed in
[`src/pages/homeTextures.ts`](../src/pages/homeTextures.ts), which is also
where "never the same picture twice on one screen" is enforced.

They are presentation components: they take props and nothing else, so they
hold no state and know nothing of the collection API. The screens that compose
them arrive with the features that need them.

The bar carries three destinations, in this order: **Home**, **Discover**,
**My Gallery**. The home is a screen of its own and not one of the modes — it
presents them — so it has its own item, and the logotype leads to the same
place without carrying the current mark. Discover is the screen where artworks
are read one after another, at the reader's own pace. My Gallery is where what
has been discovered is kept and counted.

A timed mode was drawn and dropped: it is not being built, and nothing in this
system refers to it any more.

The first of those screens is the home page,
[`src/pages/HomePage.tsx`](../src/pages/HomePage.tsx): the bar, the bento grid
and the closing band. Its seven artworks are a fixed editorial selection
([`homeFeaturedArtworks.ts`](../src/pages/homeFeaturedArtworks.ts)) of real
objects from European Paintings, the collection Discover draws from — the door
of the product opens on the same composed grid every time, at no call to the
museum, and the collection is drawn at random in Discovery mode instead. Each
tile opens its own record on Discover, at `/discover/<objectID>`.

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
primary button, labelled with the leading verb of that area — **Discover** on
the screens that offer an artwork, **Try again** or **Reload the application**
on a screen that is recovering from a failure.

A button held shut keeps its colours and loses some of its presence —
`opacity: 0.55`, nothing else. The system has no second palette for a state,
and a button that changed colour when it became unavailable would read as a
different button. The opacity is never the only sign: whatever holds the button
shut says so in words beside it, and the button points at that line with
`aria-describedby`.

Two ways of holding it, and the choice is not cosmetic. `disabled` takes the
button out of the tab order, so the line explaining the wait becomes
unreachable from the keyboard; `aria-disabled` leaves it focusable and
announced as unavailable, with its handler detached so the click does nothing.
A button whose unavailability is explained beside it takes the second form.
The band under a discovered artwork is the case this was written for — it holds
its action shut for three seconds, counts down, and uses `aria-disabled`.

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
in words on a `--color-surface-muted` ground — on `--color-surface` in the
My Gallery grid, whose frames sit on the page with no card around them. In a
thumbnail of the list the words shrink to "No image", which fits a 56 px
square where "No image available" would be cut. Alternative text follows
`Firstname Lastname, Title, year`. Only public-domain artworks, or artworks
whose rights are cleared, are displayed.

### Header

Three columns — `minmax(0, 1fr) auto minmax(0, 1fr)` — not a `space-between`
row: the logotype on the left, the navigation in the middle, one action on the
right. The side columns stay equal whatever they hold, so the navigation sits
on the axis of the page and not on the centre of the space left over between
two slots of very different widths, which put it about 60 px off.

The right-hand slot holds the **mode switch** and nothing else, as in the
mockup. An earlier mockup had a sign-in button there; the application has no
account and no server, so there is nothing to sign in to, and the slot carries
instead the one thing a reader can actually change about the page.

### Mode switch

`ThemeModeSwitch` is the day / night switch of the mockup: a `rounded-pill`
group on `--color-surface` with 4 px padding, holding two 44 x 44 px buttons
4 px apart — the sun for Sand, the crescent for Cocoa. The mode on screen wears
an inverted pill (`--color-inverse-bg` on `--color-inverse-text`); the other
button is bare and gains `--color-surface-muted` on hover.

Two buttons rather than one toggle: each side names a destination that can be
aimed at directly, so pressing the sun always gives Sand whatever the mode was.
The current side also carries `aria-pressed`, so the state does not rest on
colour alone, and the group is named `Display mode`. Pressing a side pins the
mode — it is how a reader leaves the operating system preference behind — which
is why the implicit `system` mode has no side of its own.

It stays in the bar at every width, unlike the navigation: the mode is worth
one tap everywhere, while the destinations have the screen below them.

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

Two surfaces of My Gallery answer a hover without moving, so they keep their
answer under reduced motion: a **row of the list** takes
`--color-surface-muted` on its `--color-surface` card, and the **caption of a
grid card** turns `--color-text-muted`, as a link of the page does.

### Navigation bar

A `rounded-pill` container on `--color-surface` with 4 px padding and 4 px
between links. Each link is at least 44 px tall with 16 px of horizontal
padding, in 14 px / 600 — every link carries the weight explicitly, the current
one included, so the word neither grows nor moves its neighbours when the
destination changes and the whole mark is carried by the pill. The current link takes `--color-inverse-bg`
and `--color-inverse-text`, **and** `aria-current="page"`, so the mark does not
rest on colour alone. Hidden below 761 px. Carries
`aria-label="Main navigation"`.

### Discover screen

[`src/pages/DiscoverPage.tsx`](../src/pages/DiscoverPage.tsx) is laid out on
**twelve columns with 24 px gutters**, the only grid of the system besides the
bento: the artwork takes seven columns, the wall label five, and both start at the
top. The artwork column is **sticky 24 px from the top**, so the picture stays
on screen while the record beside it is read; below 761 px the two become one
column, the picture first.

- **`ArtworkStage`**: a `--color-surface` card with 16 px of padding, 24 px
  above 761 px, holding
  one `rounded-image` frame, centred. The frame carries the **real proportions
  of the object**, from its measured height and width, and is capped by a
  **620 px height budget** — the one raw length of this screen, beside the
  bento's two row heights. An object the museum has not measured keeps a 4:3
  frame rather than a size nobody knows. The panel takes the height of its
  frame: no fixed height, so a tall portrait cannot overflow it.
- **`ArtworkWallLabel`**: one `--color-surface` card, 24 px of padding and 40 px
  above 761 px, 32 px between its parts. The title takes the artwork-title scale; the author line
  is `text-lead`, the date in `--color-text-muted` beside it. Then the blocks,
  then one secondary button that folds the rest of the record away, then that
  record and, at its foot, the way out to metmuseum.org. The folded record
  stays in the page under `hidden`, so `aria-expanded` and `aria-controls`
  describe an element that exists.
- **`ArtworkFactSection`**: a block heading at `text-caption-title`, preceded
  by an 8 px accent dot — the one ornament of the system, and it carries no
  meaning of its own: the heading beside it is worded and the dot is
  `aria-hidden`. Under it, a description list whose **label column is 112 px**,
  a layout length like the bento rows, with 16 px to the value and 8 px above
  and below each row.
- **`NextArtworkBar`**: the inverted band under the artwork — `rounded-card`
  on `--color-inverse-bg`, 24 px of padding and 32 px above 761 px. An `h2` in
  `text-tile-title`, one `text-lead` line in `--color-inverse-muted` that says
  what is being waited for, and the `inverse` button labelled **Discover
  another**. The button is held shut for **three seconds** after an artwork
  appears, so that it is looked at rather than skipped, and while the next one
  is still being drawn. It is held with `aria-disabled` and not `disabled`, so
  it keeps its place in the tab order, and `aria-describedby` ties it to the
  line that states the wait.
- **The address states.** At `/discover/<id>` the screen opens the artwork
  the address names. While it is read, a `NoticePanel` says "Opening the
  artwork…"; an address that is not a number, an artwork the collection does
  not hold or one the museum serves no picture for gets a `NoticePanel` with
  the reason and two actions — **Try again** or the primary **Discover**,
  then the secondary **Back to My Gallery**.
- **Figures in the wall label are set in the sans face**, not in the monospace
  family that the rest of the system reserves for them. A dimension or a year
  sits here inside a prose list, beside a medium and a credit line; switched to
  `text-mono` it would also drop from 15 px to 12 px and the rows would stop
  lining up. The monospace family keeps the figures that stand alone — the
  proportions under a frame, a counter.

### My Gallery

[`src/pages/GalleryPage.tsx`](../src/pages/GalleryPage.tsx) follows the My
Gallery mockup: the progress card, the layout switch, then the artworks seen.

- **The progress card**: one `rounded-card` on `--color-surface` across the
  full width, a single low row — 24 px of padding, 40 px across on desktop —
  holding the ring, two short lines and the way back to Discover on the right.
  Below 761 px the three wrap under one another.
- **`CompletionDonutChart`**: the shadcn/ui donut-with-text, in the mockup's
  shape at a smaller size: a **160 px** square and an 18 px ring. The track is
  a whole circle in `--color-surface-muted` and the share of the collection
  seen an accent arc over it, from the top and clockwise, with rounded ends.
  In the middle, as HTML laid over the chart, the share in `text-headline` and
  under it "N left" in `text-caption-title` `--color-text-muted`. The ring is
  one `role="img"` named by the sentence it draws.
- **The two lines**: the `h1` in `text-headline` says how many artworks have
  been seen, one `text-lead` line in `--color-text-muted` says out of what —
  the one fact a chart must state about its sample. The ring already gives the
  share, so the text does not repeat it.
- **`GalleryInsights`**: "More about my gallery", a secondary button with the
  chevron, 24 px under the progress card, folding a panel of two
  `rounded-card` surfaces on seven and five columns (one column below
  761 px), each with an accent-dot heading in `text-caption-title`, one
  `text-lead` line stating the question, and the chart — nothing else. The
  panel stays in the page under `hidden`, as the wall label's record does.
- **`CenturyComparisonChart`**: one accent bar per century, the axis in
  numbers of works, with 2 px tops, a grid of horizontal lines in
  `--color-surface-muted` and `text-mono` ticks. One series, so no legend. The
  collection's count of each century is in the tooltip: drawn beside the
  visitor's few works, its hundreds would flatten them, and a second axis is
  not allowed. The drawing is hidden from screen readers, which read the same
  figures from a visually hidden table.
- **Chart tooltips**: the inverted pill — `rounded-pill` on
  `--color-inverse-bg`, `text-caption-meta` in `--color-inverse-text` — the one
  surface that stands out from the card a chart sits on without a border or a
  shadow, which the system does not have.
- **`MediumPieChart`**: a 160 px pie, one slice per medium, the most frequent
  first from the top, at most five — four mediums and the rest as one. The
  fills are tokens in this order: the accent, `--color-text`,
  `--color-text-muted`, `--color-text-subtle`, `--color-inverse-muted`, parted
  by a 2 px stroke of `--color-surface`. Beside it, a legend gives every slice
  its swatch, its medium in `text-caption-title` and its count in `text-mono`:
  the legend, not the colour, is what names a slice.
- **The empty gallery**: before anything has been seen, the screen shows no
  layout switch — there is nothing to lay out — and one primary action, the
  empty state's **Discover**; the progress card leaves its own button out, so
  one destination is never offered twice.
- **`GalleryLayoutSwitch`**: Grid or List, the pill group of the mode switch —
  `--color-surface`, 4 px of padding, the side in use in the inverted pill and
  `aria-pressed`, each side 44 px tall with its icon and its word in
  `text-caption-short`. It sits on the right, 44 px under the card and 40 px
  above the collection, and the gallery reopens on the side last chosen.
- **`GalleryCollectionGroup`**: the collection's name in `text-tile-title`, one
  line on what it holds in `text-caption-title` at 400, and the count in
  `text-mono` on the right; 20 px down to the artworks, 56 px under them.
- **`SeenArtworkGrid`**: columns of at least 240 px, as many as fit, 32 px
  between rows and 24 px between columns; two columns below 761 px, 24 px and
  12 px apart. Each picture keeps the artwork's proportions in a `rounded-image`
  frame, under it the title in `text-caption-title`, the artist and date in
  `text-caption-meta`, the size in `text-mono`.
- **`SeenArtworkList`**: one `rounded-card` on `--color-surface` with 8 px of
  padding, one row per artwork — a 72 px square thumbnail, the title over the
  artist and date, where it is kept, and its size in `text-mono`; below 761 px
  the row keeps a 56 px thumbnail, the title and the artist and date.
- **Every card and every row is a link** to the artwork on Discover, at
  `/discover/<id>`: the whole figure or row is the target, named by title,
  artist and date, with the system's focus outline, and the picture's hover
  zoom of the artwork card.
- **`SeenArtworkPicture`**: a picture is only fetched once its card comes
  within about one row of the screen. Until then its frame is drawn empty at
  its final size, so nothing moves when it arrives.

The mockup also draws a filter for the artworks a visitor has liked and a heart
on each one; neither is built, since nothing records a like yet.

### Other components

- **`NoticePanel`**: the one surface of a screen that has nothing else to show
  — the first draw, a refusal from the collection, an unknown address, a screen
  that threw. A `rounded-card` on `--color-surface` with 24 px of padding,
  40 px above 761 px: an `h1` in `text-hero`, one `text-lead` line in
  `--color-text-muted`, and one action slot. It is given `role="status"` while
  something is awaited and `role="alert"` when something failed, so the reason
  is announced and not only drawn.
- **Badge**: a `--color-surface-muted` pill (padding 6 px 12 px 6 px 6 px,
  13 px / 500) containing an accent pill (3 px 8 px, 12 px), 8 px apart.
- **`ArtworkYear`**: the year of an artwork, `text-mono` on
  `--color-text-muted`, with no surface and no padding of its own, identical on
  all four artwork formats. It wore a
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
accent outline with a 2 px offset. On an inverted block the outline takes
`--color-inverse-text` instead, because the accent falls to 2.40:1 against
`--color-inverse-bg` in Cocoa, under the 3:1 a focus indicator needs. A link
that opens a new tab says so in its accessible name, "(opens in a new tab)".
A list styled without bullets carries `role="list"`, which Safari otherwise
drops, and with it the number of items. A chart is hidden from screen readers
only when its figures are also given in text: a worded summary, a table, or the
list beside it.

## Writing

Sober, direct and precise, descriptive rather than promotional. The main verb of
the product is **Discover**, optionally completed ("Discover by format"). Figures
and dimensions are always real: no invented statistics, prices or testimonials.
