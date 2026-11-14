# UI and UX principles

- Status: canonical for every app built on gawdux
- Audience: designers, engineers and AI sessions that touch UI
- Purpose: one rulebook for the house surface, so every app reads as the same
  product and no page drifts on its own

This is the generic rulebook. It states each rule in plain words and says
how it is held: by a reader, by the part of gawdux that owns it, or by
review alone. An app keeps its own rulebook for what only it has (its product names, its
modules, its exemplar pages) and points here for the rest.

Widths: "a phone" and "the compact width" both mean at or below 1024px
(`SHELL_BAR_QUERY`). Above it is the desktop.

## How the rules are held

A rule is held one of three ways, and each section ends by saying which:

- A section that ends with a "Guard:" line is held by the readers that line
  names. A host runs them over its own tree, and a finding fails its guard.
- A section that ends with an "Owner:" line and no guard is held by the
  component, token or helper named: a page that uses it gets the rule, and
  the tests named beside it hold the owner itself. No reader looks through a
  host's files for a page that goes around the owner.
- A section that ends with a "Guidance:" line, and whatever an "Owner:" line
  says is held by review, is held by review alone. Nothing fails when it is
  broken, so it is read for at every change (Review checklist).

The runner finds only what a guard's readers read. A host that points here
does not take a section with no "Guard:" line as checked.

- The owner is a gawdux component, token or helper. A page uses it and adds
  nothing of its own on top.
- The guard is a reader in `gawdux/utils` (`surface-rules.ts`): a function
  that takes a source file's text and returns what it found. A reader reads
  statically. It leaves comments out and reads a component the way Svelte
  does (`withoutComments` is that reading, for a host's own check).
- The runner in `gawdux/test-support` (`createHouseRules`) walks a tree,
  applies a reader to every file and answers the findings by file. A clean
  tree answers `{}`.
- An exception is named file by file, with its reason. An exception that
  gives no reason, that no longer allows anything, or that names a file that
  is not read is itself a finding, and so is a file left listed with no
  exception. A list of exceptions never outlives what
  it allowed.
- Geometry (sizes, gaps, what overlaps) is read in real Chromium with the
  harness in `gawdux/test-support` (`createGeometry`) at 360, 390, 900 and
  1440px, light and dark.

A host's guard is one test file:

```ts
import path from 'node:path';
import { expect, it } from 'vitest';
import { createHouseRules } from 'gawdux/test-support';
import { surfaceShadows, vanishingDarkEdges } from 'gawdux/utils';

const rules = createHouseRules(path.resolve('src'), { exclude: [/^routes\/marketing\//] });

it('draws a shadow only on what floats', () => {
	expect(
		rules.counted((source) => surfaceShadows(source), {
			'lib/components/LanguageMenu.svelte': { count: 1, what: 'the open language menu' }
		})
	).toEqual({});
});

it('draws in dark every edge it draws in light', () => {
	expect(rules.findings(vanishingDarkEdges)).toEqual({});
});
```

gawdux holds its own sources the same way (`tests/house-surface-rules.test.ts`,
`tests/house-rules-runner.test.ts`, `tests/tab-icons.test.ts`).

## Product feel

An app on gawdux should feel like serious operator software: dense enough
for real work, controlled and easy to read. It should not read as a generic
admin template or as a one-off visual experiment.

- Keep the existing visual and interaction language.
- Improve step by step, not by a style reset.
- Reuse the shared components and layouts before making new ones.
- Prefer clarity, hierarchy and confidence over decoration.

Guidance: held by review.

## Plain language

Every string a person sees uses normal, everyday language: a sentence, a
label, a title, a tooltip, an empty state, an error and an email. Wording
that tries to sound clever, literary or official reads as strange, and the
person has to stop and work out what it means.

The test: would a helpful colleague say it out loud like this to the person
who uses the app? If it sounds literary, legalistic, clipped, clever or like
a spec, rewrite it in ordinary words.

1. Use ordinary words and the common verb: records, deletes, shows,
   contains, has, can see, can open, is assigned, appears.
2. Say plainly what happens and what the person can do next. Keep to one
   idea per sentence. Keep sentences short and complete.
3. Use no idioms or metaphors. Say "permanently", not "for good". Say
   "appears here", not "lands here". Say "access level", not "rung". Say "is
   sent to", not "goes to".
4. Use no spec or internal words: "act" as a noun (say "action" or the
   verb), "holds" for has or contains, "names" for lists or gives access to,
   "reaches" for can access, "carries", "surface", "the house", and "kept
   for the record" (say "kept as a record"). Say a state, not "stays" or
   "goes".
5. Keep the meaning exact. A statement about what is deleted, kept or
   recorded, what cannot be undone, or who can see or sign states the same
   facts after a rewrite, no fewer and no more. If you are not sure what the
   code does, read it.
6. Keep the decided words: status names, product nouns, place names and
   button labels. Add no new terms.
7. If a sentence only states the obvious, delete it instead of rewriting it
   (No text that states the obvious).
8. An error keeps its two parts (Errors). Rewrite only the first sentence.
9. A label or a header is one line with no period. Never use an em dash or
   an en dash.
10. Marketing and legal copy and developer-only text (guard messages, test
    helpers, log lines, code comments, internal errors no person sees) are
    outside the rule. An API refusal that a person sees is inside it.
11. Briefs, requirements and decision records are written for engineers.
    Their phrasing is never copied into the app.

Some rewrites:

- "The audit trail keeps the deletion." became "The audit trail records the
  deletion."
- "Its open tasks go for good." became "This permanently deletes its open
  tasks."
- "Nobody holds this Role yet." became "No one has this Role yet."

The backstops are two readers. `plainLanguageFaults` lists every phrase of
`PLAIN_LANGUAGE_PHRASES` that a string a person reads uses: a component's
text, the attributes a person reads, its strings and a copy module's
strings. `readableDashes` lists every em dash and en dash in those strings;
a host may declare one placeholder (a lone mark for an empty value). Both
keep a removed phrase from coming back. Neither proves that the copy is
plain. Reading every new or changed string out loud does that.

Guard: `plainLanguageFaults`, `readableDashes`. Whether a sentence is plain
is held by review.

## The house surface

### One page frame

Every app page renders in one frame: `PageFrame`, which the app shell's main
column renders once around the page and the command bar. The frame owns the
page's panel: its inset from the column (`--gawdux-frame-gutter`, 8px; none
at the compact width, where it runs edge to edge), one edge and one radius
around its surface and the bar together, the page's one elevation and the
seam with the bar.

Content is never placed straight on the shell's background. No page draws a
page-level surface, panel, edge, corner or seam of its own. The hosts that
fill the page take the frame's height (`.page-fill`, layout only):

- `PageTabs` for a tabbed detail page.
- `ListSurface` or `TableContainer` for a list page. A page's list draws no
  card of its own.
- `EditablePageScaffold` with `surface` for everything else: a single panel,
  a create or edit form, a read-only page, a standalone `MasterDetailShell`.

The seam is one seam, the same on every page, at every width, light and
dark. A drawn bar takes the surface's bottom corners, so the seam is one
straight full-width edge with no rounded corner, no gap and no band. A bar
with nothing in it is not drawn, and the surface keeps its own bottom
corners. A card nested in the content never meets the bar and keeps its own
corners. On paper the frame draws nothing and the bar is not printed.

Owner: `PageFrame`, `tokens.css`. Guard: `pageSurfacesOutsideFrame` (a
retired page surface, a frame part, a bar drawn by hand or a `<main>` of a
page's own) and the runner's `layoutResets()` (the routes that leave their
layout, which a host lists with why).

### One inset on all four sides

One inset on every surface, the same on all four sides: 16px above 1024px
and 8px at or below it (`--gawdux-page-inset`, set from
`--gawdux-compact-inset` at the compact width). A card in a tab panel sits
that far below the tab strip, in from the panel's sides and above the bar's
seam.

The inset hosts own it and nothing else reads it: `.scroll-surface` (a tab
panel's default), `.page-inset`, `EditablePageScaffold`'s body,
`MasterDetailShell`'s frame (`.master-detail-inset`), `TabFillPanel`'s
scroll, and a list's toolbar (`FilterBar`), which takes it at its top and
its sides. A page adds no outer padding of its own. A tab column
(`.panel-col`, `.panel-col-wide`) pads nothing. Cards inside the surface are
`CardContainer` with `space-y-4` between them.

Guard: `insetOverrides` (the knob read or set outside its owners, a frame
fill-height calc) and `paddedTabColumns`.

### Light and dark draw the same lines

A theme changes an edge's colour, never whether it is drawn. An edge drawn
in light in a colour of its own (a box's border, a ring, the line between a
list's rows) is drawn in dark too. In dark the house's edge is
`--gawdux-border`, never transparent, of no width or style, or the colour of
the surface the edge sits on. In dark a card and the page's content surface
both draw the card surface (`--gawdux-surface-card`), so a line of that
colour on either is not drawn.

Guard: `vanishingDarkEdges`.

### No shadow inside the page

The page has one elevation, the frame's (`--gawdux-surface-elevation`).
Nothing inside the page draws a shadow of its own: a card, a panel, a pane,
a table's box, a tile, a selected row or pill, a button, a drawer and a
notice are flat, told apart by their edge and their surface.

A shadow belongs only to what floats above the page and closes (a menu, a
picker's list, a tooltip, a toast, the command palette, a sheet over the
page on a phone) and to a page outside the app's shell (sign-in, an email).
A focus ring and a hard line (a layer with no blur) are edges, not shadows.

Guard: `surfaceShadows`, counted file by file with what each shadow is
(`rules.counted`); `shadowedFlowbiteImports` (a wrapped component that
hard-codes a shadow); `elevationReads` (the page's elevation read outside
the frame).

### One icon size

An icon in a pane header, a tab strip, a rail row or a header's icon button
is the house icon, 20px (`--gawdux-icon-size`, drawn by `.gawdux-icon`).
`IconButton` at a header's size (`md`), `HeaderStatus`'s lock and
`TabTitle`'s icon take it from gawdux. A header's file sizes no icon of its
own.

Every icon on a tab strip's row is the house icon, a tab's and a tool's
alike (`.gawdux-tool-button`). A labelled button in the command bar keeps
its 16px icon (`.top-action-icons`): its label is the action, and the bar
never shows its icons alone.

Guard: `handSizedIcons`.

### One icon button

An action with an icon and no words is `IconButton`, flat in light and dark
alike: no border and no shadow at rest, a quiet fill on hover. In a header
it is `size="md"`, a 44px target at the compact width. Every header control
is flat the same way and takes the header's quiet fill under the pointer
(`--gawdux-header-control-hover-surface`). Keyboard focus keeps its visible
ring on each.

Owner: `IconButton` and the header's control tokens in `tokens.css`. A
button drawn by hand in its place is held by review.

### A rail row lays itself out

Every row of a list rail is `RailRowButton`, which lays it out: its icon (or
a leading mark, such as initials) on the title line, a badge, a count or a
dot at the title line's end, and the meta line under them across the row's
full width. A caller passes `title`, `meta`, `icon` or `leading` and
`trailing`, and lays out nothing of its own.

Guard: `handRolledRailRows`.

### One padding inside a card

A card's text stands one card padding in from its edge, 16px on all four
sides at every width (`--gawdux-card-padding`). A card keeps it on a phone,
where only the page's own gutters tighten to 8px. `CardContainer` pads its
header's sides and its body with it, as `.card-header` and `.card-content`
do. A card a page draws takes `.card-content` and sets no padding of its
own. A box nested in a card adds only its own row padding. Pages outside the
app's shell and what floats are outside the rule.

Guard: `handSetCardPadding`.

### A choice of one is not drawn

A control that offers one choice is not drawn. A register's saved views rail
(`SavedViewsRail`) shows only with a saved view to choose or a query that
can be saved (`savedViewsRailShows`). With the default alone and the default
query it draws nothing and takes no room. Applying a filter brings it back,
so the way to save a view is kept. A track of pills (`FilterPillRow`) is a
fill with no edge of its own, so a pressed pill's ring is the one line
around it.

A host draws the rail bare in its slot: no condition, no wrapper and no
class of its own, and no edge styled onto the track or its pills.

Guard: `hostChoiceChrome`, over components and stylesheets: the runner hands
it each file's path, and it reads a `.css` file as a stylesheet.

### A register on a phone

At or below 1024px a register's rows are labelled cards (`tokens.css`, "A
register on a phone"). Every table in a list's scroller
(`.list-table-scroll`, which `ListSurface` draws) or in
`.responsive-card-table` hides its head from sight (it is kept for assistive
technology) and draws each row as a card, each value under its column's
name, wrapping instead of truncating.

Each body cell names its column (`data-label`, the host's word for it) or
its place in the card (`data-card`): `title` heads the card, `wide` spans
it, `end` sits at its top right, `detail` spans the card under an opened
row. A register draws one table at every width. An app keeps no card rules
and no phone list of its own. `DataTable` labels its cells from its column
definitions.

A card's cell is as tall as what it holds. A row height an app sets for its
tables (`--gawdux-table-row-height`) is the least a table's row may be, and
it applies above 1024px only: in a card a value with a second line takes
the room it needs, and never draws over the next line of its card. An app
writes no rule of its own for it.

A table in a card of a detail page reads as cards the same way: its
container takes `.responsive-card-table` (`TableContainer`'s or
`DataTable`'s `className`).

Guard: `unlabelledRegisterCells`.

### A phone sort on every sorted register

A register that sorts by its column heads hands its toolbar the sort, which
the toolbar offers at or below 1024px, where the heads are hidden. Above
1024px the heads sort and the toolbar draws none. There are two ways to hand
it over, and a register uses one:

- `ListQueryBar`'s `sort` (`ListSort`, `listSortOptions`), for a register
  with a query bar.
- `FilterBar`'s `sort`, which `ListSurface` and `ListPageScaffold` pass on,
  for a register whose list draws its own toolbar.

A register in a card has no toolbar: a table in a detail page's card that
reads as cards on a phone (`.responsive-card-table`). It draws the same sort
itself, above its table, and uses one of two ways as well:

- `DataTable`'s `sort`, beside the `sortField`, `sortDirection` and `onSort`
  its heads take: the table draws the sort above its rows.
- `ListPhoneSort` (`gawdux/primitives`), for a table the app writes out:
  drawn in the table's container, above the table, it stands on the cards'
  inset.

Either way it reads the same: "Sort by" and one choice per key and
direction, each order worded ("Due: latest first", "Name: A to Z"). A
register's own order before a key is chosen reads "Default order". No
register draws a phone sort of its own, and no register is given two.

A key says its own orders. Each kind has words of its own: text reads "A to
Z" and "Z to A", a date "latest first" and "earliest first", a number
"highest first" and "lowest first". A key gives its own in their place with
`words` (`ListSortWords`): `{ asc: 'best first', desc: 'worst first',
first: 'desc' }` reads "Health: worst first", then "Health: best first". A
sequence (`order: 'sequence'`) is the app's own order, a schedule's states
or a health from worst to best, and only the app knows what its two ends
mean, so a sequence key always gives its words. One that gives none reads
"first to last" and "last to first", and is reported. `listSortWords` gives
one order's words to a line that says how a register is sorted.

Guard: `registersWithoutPhoneSort`, which reads each register on its own,
accepts a `ListPhoneSort` that takes the sort for the heads it serves, and
lists a `DataTable` written as cards on a phone that sorts by its heads and
draws no sort; and `unwordedSequenceSorts`, which lists every sequence key written with no
words (`listSortKeyFaults` reads the keys themselves, for keys no source
writes out).
Heads whose toolbar is another file's are listed with why, and the runner
checks that file takes the sort, a query bar's or a list toolbar's
(or a `ListPhoneSort`; `rules.phoneSorts`, `takesPhoneSort`). The list allows a file only its
heads with no toolbar of its own: a listed file whose own toolbar takes no
sort is still reported.

### One scroller per list

`.list-table-scroll` scrolls both ways and the column heads stick to its top
edge. Nothing between it and the table scrolls on its own: no
`overflow-x: auto` region, wrapper or utility around the table. A wrapper
with its own overflow becomes the head's scroll box, grows with the rows and
never scrolls, and the head rides away with them. Outside a list (a detail
page's `TableContainer`) `.list-table-frame` is the sideways scroller and
the heads do not stick.

Owner: `.list-table-scroll` and `.list-table-frame` in `tokens.css`
(`tests/density-and-tab-tokens.test.ts`, `tests/register-phone.test.ts`). No
reader looks for a wrapper that scrolls around a table: that is held by
review.

### One count pill

What waits on the reader shows as one count on the icon of its place: a tab,
the notices bell, a chat view. The pill is `.gawdux-icon-count` (a tab's
through `TabTitle`'s `count`): 16px at the icon's top right, ringed in the
surface it sits on, red while something urgent waits, "9+" past nine, and
read with the place's name ("Workflow (1)"). No page draws a pill of its
own.

Guard: `handDrawnIconCounts`.

## Tabs

A tab strip is one row at every width (`.gawdux-tab-strip`). Tabs that do
not fit scroll sideways inside the strip. They never wrap and never scroll
the page.

A tab is an icon and its label (`TabTitle`). One meaning has one icon on
every strip. The icons come from the tab icon table: `TAB_ICONS` in
`gawdux/primitives` is the base (Content, Workflow, Process, Access,
Automation, History, Versions, Details, Overview and the administration
tabs), keyed by the label a tab shows. An app adds its own meanings with
`extendTabIcons` and names every tab from the table it gets back. The base's
icon for a meaning is kept, unless the app's strips already draw that
meaning another way: then the app names the meaning in `replaces` with its
reason, and a change it does not name is refused. One meaning still has one
icon in the app.

While the strip's labelled tabs fit its own box, never the viewport's, they
show their labels. When they do not (`fitLabels`), every tab shows its icon
alone on a 44px target, its label kept as its name and its tooltip.

History is the last tab on every page that has one.

Guard: `tabIconFaults` (a tab with no icon, a known meaning with another
icon), `tabsAfterHistory`.

### Anything that scrolls sideways says so, one way

A strip that scrolls sideways fades out at the edge where more of it lies,
and only there. `scrollEdges` marks it with the side or sides
(`data-scroll-fade`) and `.gawdux-scroll-fade` draws the fade as the strip's
own mask, so nothing is laid over the strip. One rule serves a page's tab
strip, a register's quick filters and a drawing in its box. A strip that
shows all of itself carries no fade, and no strip draws a mark of its own.

Owner: `scrollEdges` and `.gawdux-scroll-fade` (`tests/scroll-edges.test.ts`).
A mark a strip draws of its own is held by review.

## The header

Above 1024px the trail (`Breadcrumbs`) is one line and never clips a crumb.
When it does not fit, the crumbs on the way to the page fold, from the
middle outward, into one button whose menu lists them in order. Then the
section's crumb shows as its icon alone. The current page is cut with an
ellipsis only as the last resort, its full name in a tooltip and in the
menu.

At or below 1024px the trail is one row: the section's icon, then the
current page's name as a button with a chevron, a 44px target. The button
opens the path below the header, a menu and never a modal: every level from
the top down as a link, the current page last and marked with the house's
selected row (`--gawdux-row-selected-surface`, `--gawdux-row-selected-text`).
Names wrap between words, and an identifier, a version or a date is never
broken (`breadcrumbWords`). A page does not shorten its own labels to fit
and draws no trail of its own.

The controls beside the trail give their room to it (`createRoomYield`):
when the whole trail does not fit beside them at full size, a control shows
its icon or avatar alone. The decision is made on the room the trail would
have with the controls at full size, so a control never flickers between its
two sizes.

Owner: `Breadcrumbs`, `breadcrumbWords` and `createRoomYield`
(`tests/Breadcrumbs.test.ts`, `tests/breadcrumb-overflow.test.ts`,
`tests/room-yield.test.ts`, `tests/trail-place.geometry.test.ts`). A trail a
page draws of its own is held by review.

### A status shows once

An item's status shows once, at every width, in the item's own header beside
its title. The trail carries none. Every pane that shows one item is headed
by `PaneHeader`, which reads in one order: the item's icon, its name, its
state, then its controls. The state (`HeaderStatus`: the chip, and a lock
beside it while the reader cannot edit) stands after the title, never among
the controls at the row's end. The pane header claims the page's status
(`PAGE_STATUS_CONTEXT`), so a tab strip under it draws none. A tabbed page
with no pane header shows its status at the end of its tab strip, after the
strip and never over a tab.

What sits beside the status says the rest of it, never the status again. A
count shows once too: the command bar carries it.

A pane header's second line is the item's own value or nothing. It never
shows a stock line that stands in for a missing value.

Guard: `statusAmongControls`, `stockCaptions`.

### Tight leading controls

A control that leads a row at the screen's edge is a 44px target tight to
that edge. At the compact width the menu button has no padding or gap of its
own around it, so its glyph sits close to the edge while its target keeps
44px.

Owner: `ShellHeader` (`tests/ShellHeader.test.ts`,
`tests/phone-shell.geometry.test.ts`).

### Tight levels zero and one

At or below 1024px the shell's nesting gives its width back to the content.
Level zero, between the screen and the page's panel, is none: the panel and
the command bar run edge to edge, with no side border, radius or shadow.
Level one, the panel's inset and the content inset of the hosts directly
inside it, is 8px (`--gawdux-compact-inset`). A card, a field or a tile
nested in the content keeps its own padding and gains the width. The rule is
one, in `tokens.css`. A page does not set its own phone inset.

Owner: `tokens.css` (`tests/compact-levels.test.ts`). A phone inset a page
sets of its own is held by review.

## The command bar

The bottom command bar is shell chrome, rendered once by the page frame
under the page's content. A page never draws its own bottom bar. It fills
the frame's bar through its scaffold or through the bar's zones
(`PageCommandBar`, `PageCommandBarCenter`, `PageCommandBarRight`).

- A page with nothing to offer passes no actions. It does not render an
  empty group, a spacer or placeholder text into a zone, and a bar with
  nothing in it is not drawn.
- Actions are ordered by lifecycle, all outline, equal weight. A destructive
  action is red, a save is green, nothing else is coloured.
- A command that removes what the page shows is the last of the page's
  actions and asks through the house confirmation, naming what goes.
- An action on a list page's selected item (delete, archive, restore,
  retire) is a command bar action, shown while an item is selected. It is
  never a button in the form card or the detail. A row's own action inside a
  list stays on its row.
- An action's label is sentence case: its first word capitalised and the
  rest in lower case ("New role", "Save as draft"), but for acronyms
  (`ACTION_LABEL_WORDS`), the app's proper nouns and an item's own name. A
  place's name (the rail, a tab, a page's title) keeps its own case.
- A door to another place reads the place alone. Its accessible name is
  "Open in" and the place (`PlaceDoor`).
- A count in the bar reads one way (`PageCommandBarProgress`): the words
  small and on one line above a thin track as wide as they are, so the bar
  is no taller with it.

Guard: `miscasedActionLabels`, `itemActsInCards`.

### The bar holds the open tab's actions

On a tabbed page every action in the bar names its tab (`tab` on a bar zone
or a scaffold action, `actionsTab`), so it shows only while its tab is open
and a tab with no action draws no bar. A page's open tab is
`PAGE_TAB_CONTEXT`, which `PageTabs` reports. `EditablePageScaffold`
publishes it to what it holds. A page whose actions sit beside its scaffold
publishes it itself (`createPageTabHost`). A drawer out of the bar closes
when the tab changes.

Guard: `untabbedBarActs` over every file that draws tabs (`drawsTabs`),
`tabActsOutsideTabHost`.

### One action pair

A decision's Cancel and its action are one action pair
(`PageCommandBarPair`), in every drawer and in edit mode: one height,
padding and type, a focus ring only on keyboard focus, the action in its own
tone. Cancel goes back out of the decision, so it is neutral. It is red only
while cancelling would discard input the person entered (a changed field, a
typed reason; a password is not information), and neutral again once that
input is cleared. A confirmation takes no input, so its Cancel is neutral.

A host passes the action and whether input would be lost (`discards`: edit
mode's `createEditMode` `changed`, a create form's fields against their
opening `editSnapshot` by `sameEditValue`) and draws no Cancel of its own.
An action that cancels something is named for what it cancels ("Cancel
run") and keeps its own tone.

Guard: `handDrawnCancels`, `editModesWithoutDiscards`.

### Decisions open out of the bar

A yes or no decision opens the way every command surface opens: a drawer
rises out of the bar with the words, and Cancel and the action take the
bar's centre zone in place of the page's actions. Nothing floats and nothing
is modal. The mechanism is `PageCommandBarConfirm`, reached through
`ConfirmationCommandSurface`; the discard guard is
`DiscardNavigationCommandSurface`.

A confirmation asks one question. Its title names the action and the item
("Archive “Draft cleaners”?"). The line under it gives only what follows
("Its members keep any access they have from other sources.") or is absent.
It never asks again or restates the action. An item's name in the question
is set in curly quotes. A drawer that takes input (a reason, a field, a
signature) is titled by its action and is not a yes or no question. A
failure shows its reason in the drawer, so the person retries or cancels in
place.

A decision that takes words or fields opens the same way, through
`CommandDrawer` (`.page-command-drawer`). A signature is
`SignatureCommandSurface` (`gawdux/validation`): the statement, what
follows, the signer, the password and the reason with its rule. A refusal
returns focus to the password. Escape closes the drawer and nothing behind
it. The password and the reason clear on every close.

The drawer and the bar read as one surface that opened up out of the bar:
the drawer stands on the bar's own surface (`--gawdux-command-surface`), the
seam moves to the drawer's top edge, and no line, shadow or gap runs between
the drawer and the bar. The drawer is mounted where the page's content ends,
outside any scroller or padded body.

Guard: `questioningConfirmations`.

## Errors

A person never sees an implementation error. Every failure a page can show
is one of four kinds, and each kind has one sentence shape:

- **Refused**: the server said no (permission, conflict, invalid input). Say
  what was refused and why, in the person's words. No retry framing.
- **Not sent**: the request never left the browser. "Nothing was recorded.
  Try again."
- **Unresolved**: the request was sent and no answer came back. "The result
  is not known yet. Reopen the record before trying again."
- **Broken**: a defect. "Something went wrong on our side. The record was
  not changed." Never invent recovery advice.

Each has two parts: first what happened, in the person's words, then what
lets it be found or fixed, without alarming anyone. A refusal says what was
refused, then what to do. An outage says the caller's sentence, then the
kind of failure and the request's reference to quote. The platform's own
text (a query failure, a constraint name, a host, a path) is never either
part. The sentence of an action that did not complete names the thing and
the action: "The document could not be retired."

One presentation carries all four: a full-width strip inside the content
panel, directly under the panel's header chrome (the tab strip, the filter
bar) or under its top edge when there is none. The content below it moves
down. Nothing above it moves. It is the same strip, in the same place,
whether the operation failed or the load did. The shells own it
(`EditablePageScaffold` collects the messages, `PageTabs` renders the strip
for a tabbed panel, `ListSurface` under its toolbar, `SurfaceFeedbackOutlet`
for a page of panes). A page never renders its own card, alert or panel for
an error.

- A failed action goes to the scaffold's `actionError`, dismissable.
- A failed load goes to `loadError`, not dismissable.
- A standing condition of the record (archived, read-only) goes to `notice`
  with a tone. Same strip, not dismissable.
- Field validation stays under its input.

Copy rules: no HTTP codes, no exception text, no route or table names, no
"API", "500", "null" or stack fragments.

A transient message (a save that worked, a copy to the clipboard) is a toast
from the message center (`createMessageCenter`, `MessageHost`): a success
and an info leave on their own, a warning and an error stay until they are
dismissed.

Owner: the shells named above and `MessageHost`, for where a message shows
(`tests/SurfaceFeedback.test.ts`, `tests/SurfaceFeedbackOutlet.test.ts`,
`tests/MessageHost.test.ts`). The four kinds, the two parts and the copy
rules are held by review: no reader reads an error's words.

## List tables

- A list row whose only primary action is "open the detail page" is a row
  link: the whole row calls `activateRowLink` on `click` and `auxclick`, so
  a modified or middle click opens the record in a new tab. A row that
  answers a click of its own asks `isRowClickTarget` first.
- Do not add a "View" button when the row is already clickable.
- Use an actions column only when the row has several distinct actions.
- Edit and destructive actions normally live on the detail page, not the
  list.
- A cell that holds free text wraps inside its own cell. Only identifiers
  and dates stay on one line.

Owner: `activateRowLink` and `isRowClickTarget` (`tests/row-link.test.ts`,
`tests/row-link-table.test.ts`), for the row link. The rest (no "View"
button, where the actions live, what wraps) is held by review.

## Navigation

- The rail and the trail name one place. The side rail marks the item the
  address lies in, and the trail's first levels name that item's group and
  the item, from one resolution (`resolveRailPlace`), so the two never
  disagree.
- In a collapsed sidebar, groups open on click only. Hover does not open a
  flyout. Only one flyout is open at a time. Opening another group, a press
  outside, Escape or a route change closes it.

Owner: `resolveRailPlace` (`tests/shell-rail-place.test.ts`,
`tests/shell-rail-trail.test.ts`) and `AppSidebar`, for its flyouts.

## Small sets: a list with its detail in place

Entities that usually number one to ten rows share one master and detail
pattern, `MasterDetailShell`: one bordered, flat surface split into a
selector rail and a detail pane.

- A rail row is an optional avatar, a two-line text block (the name and one
  quiet qualifier) and at most one status element on the right.
- The selection is a deep link, carried as a query parameter beside the tab,
  so a reload and a shared link restore both. With no selection the first
  row is selected, so the detail pane is never empty.
- Create and edit swap the detail pane for the form. The rail stays visible.
  Nothing is modal. Actions that change something ride the command bar.

Large sets keep the sortable list table.

Owner: `MasterDetailShell` (`tests/MasterDetailShell.test.ts`). The deep
link and the choice between this pattern and a list table are the page's,
held by review.

## The phone shell

At or below 1024px a phone has one bar, along the bottom of the screen, and
no other: `ShellBar`, a row of 44px targets clear of the safe-area inset,
that fits 360px. The side rail is a drawer (`ShellNavigationDrawer`), the
header is one row 48px tall with the menu button and the trail, and the
account controls are at the bar's right end, the account last. Each of the
bar's menus opens upward as a sheet above it, never a modal
(`.gawdux-shell-bar-sheet`). The shell leaves `--gawdux-shell-bar-space`
under the page, and the command bar sits directly above the bar. The theme
is one row of the account menu, "Dark mode" with a switch
(`UserMenuThemeRow`).

On a phone a register's filter row puts the filter button at the end of the
row of quick filters, on a line below the search.

Owner: `gawdux/shell` (`AppShell`, `ShellHeader`, `ShellBarEnd`,
`AccountCard`), its geometry read in real Chromium
(`tests/phone-shell.geometry.test.ts`, `tests/shell-bar.test.ts`). A second
bar a page draws of its own is held by review.

## Long values

A value too long for its box breaks only where breaking it keeps it whole
enough to read (`LongText`, `longTextRuns`):

- An identifier (a record number, a version) never breaks inside itself. It
  wraps to the next line whole.
- A hash wraps anywhere inside its own box, never outside it and never with
  an ellipsis.
- A moment (a day with its clock and its zone) stays whole on one line.
- A separator (" · ") stays with the part before it
  (`LEDGER_PART_SEPARATOR`), so no line starts with the dot.
- A line built of parts wraps between its parts, never inside one.

Owner: `LongText` and `longTextRuns` (`tests/long-text.test.ts`). A long
value a page sets outside `LongText` is held by review.

## No text that states the obvious

A drawer, a form and a caption say only what the person needs and cannot see
from the control: what they act on, its meaning, a consequence they cannot
see otherwise, and a rule the control holds them to before it would refuse
(a reason's length, a file's size limit). They never say that an action is
recorded, that an optional field may be left blank, what a button obviously
does, or what a refusal will say when it happens.

A field's caption never restates its label. A section's caption never
restates its heading. An empty state says what is so ("No folders yet")
without naming the button that makes the first one. An empty state's title
is a label and never ends with a period. Its message, a sentence, keeps its
own.

Guidance: held by review.

## What a history row says

A history row first says what happened, in the app's words ("Submitted",
"Signature withdrawn"), and a person's note or reason follows as theirs:
"Submitted · Note: Ready for review." The words a person typed are the row's
note or reason, never its label. An app label never ends with a period. A
person's words keep theirs.

Guidance: held by review.

## Dates: a day is not a moment

There are two kinds of value, and mixing them is a defect, not a formatting
preference.

A **calendar date** is a day: a due date, an issue date, an expiry. It has
no time and no zone. It travels as `yyyy-mm-dd` and renders as the day it
says in every zone on earth.

An **instant** is a moment: a row's creation, an audit entry, a signing, a
chat message. It travels as ISO 8601 and renders in the site's zone with the
zone named, so every reader sees the same clock.

- Never render a calendar date through a zone conversion.
  `new Date('2026-09-04')` is midnight UTC, and a reader west of it sees the
  day before. Use `formatCalendarDate`.
- Never show a time that was not recorded. A date has no time; a midnight
  rendered beside it is invented data.
- "Today" is a calendar idea and needs a zone, and the zone is the site's,
  not the reader's (`todayInZone`). A page reads the day the layout resolved
  and never computes one of its own.
- A site zone is an IANA name, never a fixed offset.
- A time names its zone each time it is shown, never once for a whole
  surface. A full stamp reads `2026-11-03 17:55:07 EST`
  (`formatAuditDateTimeText`).
- A day or a stamp is never broken inside itself.

Owner: `formatCalendarDate`, `todayInZone` and `formatAuditDateTimeText`
(`tests/temporal.test.ts`). A date a page formats of its own is held by
review.

## Text contrast

Text meets WCAG AA, 4.5:1. The 3:1 exemption for large text needs 24px or
more, or 18.66px bold, which almost nothing in an operator app reaches.

- Opacity on text destroys contrast and cannot be won back by colour. If a
  thing must read as secondary, use weight, size, a lighter border, position
  or a badge.
- A bare `text-gray-400` with no light counterpart is usually a bug: it
  passes on a dark panel and fails on white. Pair it, `text-gray-500` in
  light and `dark:text-gray-400` in dark, unless the surface is dark in both
  themes by design.
- Check contrast against the composited background, not the class name.

Guidance: held by review. No reader pairs `text-gray-400` with its light
counterpart or measures a contrast.

## Forms

The house owns its form layer: `.form-input` in `tokens.css`. Do not add or
load `@tailwindcss/forms`. The plugin injects base rules keyed on elements
and attributes, restyles every native control the tokens deliberately leave
alone (checkboxes and radios keep their own sizing), and changes an approved
design across every form at once. If native control styling needs work,
extend the token: one place, with a known reach.

Owner: `.form-input` in `tokens.css`. No reader looks for the plugin in a
host's stylesheet: that is held by review.

## Checking in a browser

Headless checks (screenshots, geometry, a pass by eye) go through a harness
that emulates `prefers-reduced-motion`, so animated surfaces render still
frames because the app honours the media query, not because anything was
turned off in the build. Never freeze or weaken a production visual to make
headless tooling cheap or stable. If a surface misbehaves under reduced
motion, that is a defect on the surface. Fix it there.

Guidance: held by review.

## Spreading a pattern

- Try a new pattern in the one surface it is for.
- Review and approve it there.
- Only then spread it, the same way everywhere.

A pattern every app needs goes into gawdux, with its guard, so each app gets
it by its pin and none keeps a copy.

Guidance: held by review.

## Review checklist

Before shipping a UI change, ask:

- Does it still feel like the same product, and is the change a step and not
  a style reset?
- Would a helpful colleague say each new or changed string out loud this
  way, and does it state the same facts as the code?
- Does the page stand in the page frame, with no surface, panel or seam of
  its own?
- Is a card in a tab panel inset the same on all four sides, from an inset
  host and not from the page's own padding?
- Does anything inside the page draw a shadow, or only what floats above it?
- Does every edge drawn in light show in dark?
- Does every tab carry its icon from the table, do its words give way to the
  icon alone only when the strip's own box is too narrow, and does History
  come last?
- Does the bar hold only the open tab's actions, and does Cancel read
  neutral until cancelling would discard what was entered?
- Does a confirmation ask once?
- At 390px, is there one bar along the bottom, a one-row trail whose page
  name opens the path, the panel edge to edge with its content 8px in, and
  an item's status and count each shown once?
- At 390px, does every register read as labelled cards, and does every
  sorted register offer "Sort by"?
- Does every date show a time only if a time was recorded?
- Does a long value break only as Long values allows, and does any text
  state the obvious?
