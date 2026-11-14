<!--
	@component
	The account card: UserMenu's other presentation, for a host that opts
	into it by drawing this in place of UserMenu. The menu's keyboard, pointer
	and focus behaviour is UserMenu's own (its `presentation`); only the
	markup differs. UserMenu's default sheet stays as it is for every host
	that does not.

	In a header it is a card that names the person and grows downward when
	opened: the email under the name, Profile and Sign out side by side, the
	role chips under the access label and a line with the product's mark and
	version. `compact`, and a screen at or below the compact width, show the
	avatar alone; the open panel then grows to the left from it. A header
	that yields its room (ShellHeader) reads the card's full width from its
	probe (`data-room-full`).

	In the phone shell's bar (`inShellBar()`) it is the avatar alone, a 44px
	target, and its body rises above the bar as a sheet, never a modal: the
	person, the two rows, the theme as a row ("Dark mode", when
	`themeCookieName` is given: the shell's one theme control at that
	width), the host's extra rows (`extras`: a switcher's choices), a reading
	(`meter`), then the roles and the version.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowRightToBracketOutline, UserCircleOutline } from 'flowbite-svelte-icons';
	import UserMenu from '../components/UserMenu.svelte';
	import UserMenuThemeRow from '../components/UserMenuThemeRow.svelte';
	import { inShellBar } from '../primitives/shell-bar';
	import { slideFadeIn, slideFadeOut } from '../utils/transitions';

	let {
		compact = false,
		initials,
		name,
		email = '',
		roleLabels = [],
		accessLabel = '',
		rolesLabel = 'Roles',
		profileHref,
		profileLabel = 'Profile',
		signOutAction,
		signOutLabel = 'Sign out',
		themeCookieName,
		themeLabel,
		product = '',
		versionLabel = '',
		versionTooltip,
		mark,
		extras,
		meter,
		id = 'gawdux-account-card'
	}: {
		/** The avatar alone at every width: the header's trail needs the room. */
		compact?: boolean;
		initials: string;
		name: string;
		email?: string;
		/** One chip per role. */
		roleLabels?: string[];
		/** The access the session has ("Member"), the chips' caption. */
		accessLabel?: string;
		/** The word before the access label when there are chips. */
		rolesLabel?: string;
		profileHref: string;
		profileLabel?: string;
		/** POST target of the sign-out form. */
		signOutAction: string;
		signOutLabel?: string;
		/**
		 * The theme row in the bar's sheet: the cookie the host's server reads
		 * to draw the first paint in the theme. Left out, the sheet has none.
		 */
		themeCookieName?: string;
		themeLabel?: string;
		/** The version line: the mark, then `{product} {versionLabel}`. */
		product?: string;
		versionLabel?: string;
		versionTooltip?: string;
		/** The product's mark, in a 20px box before the version. */
		mark?: Snippet;
		/** More rows of the menu, after the theme, in the bar's sheet. */
		extras?: Snippet<[{ close: () => void }]>;
		/** A reading below the menu, in the bar's sheet. */
		meter?: Snippet;
		/** Prefix of the element ids; the card in the bar adds "-bar". */
		id?: string;
	} = $props();

	const inBar = inShellBar();
	const versionLine = $derived([product, versionLabel].filter(Boolean).join(' '));
</script>

{#snippet rows(menu: { close: () => void })}
	<a
		href={profileHref}
		onclick={() => menu.close()}
		role="menuitem"
		tabindex="-1"
		class="row"
		data-account-profile
	>
		<UserCircleOutline class="gawdux-account-card-icon" />
		{profileLabel}
	</a>
	<form method="POST" action={signOutAction} class="sign-out" role="none">
		<button type="submit" role="menuitem" tabindex="-1" class="row danger" data-account-sign-out>
			<ArrowRightToBracketOutline class="gawdux-account-card-icon" />
			{signOutLabel}
		</button>
	</form>
{/snippet}

{#snippet facts()}
	{#if accessLabel || roleLabels.length}
		<div class="facts" data-account-facts>
			<p class="access">
				{roleLabels.length && accessLabel
					? `${rolesLabel} · ${accessLabel}`
					: roleLabels.length
						? rolesLabel
						: accessLabel}
			</p>
			{#if roleLabels.length}
				<div class="chips">
					{#each roleLabels as roleLabel, index (`${index}:${roleLabel}`)}
						<span class="chip">{roleLabel}</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if versionLine || mark}
		<div class="version" data-account-version>
			<p title={versionTooltip}>
				{#if mark}<span class="mark" aria-hidden="true">{@render mark()}</span>{/if}
				<span class="version-text">{versionLine}</span>
			</p>
		</div>
	{/if}
{/snippet}

<UserMenu
	{name}
	{email}
	{initials}
	items={[{ label: profileLabel, href: profileHref }]}
	{signOutAction}
	compactBelow={1024}
	compact={compact || inBar}
	id={inBar ? `${id}-bar` : id}
>
	{#snippet presentation(menu)}
		{#if inBar}
			<!-- In the phone shell's bar: the avatar, a 44px target; open, the
			     sheet above the bar names the person, then the rows, the theme,
			     the host's rows and reading, the roles and the version. -->
			<div
				class="gawdux-account-card in-bar"
				data-account-card="bar"
				data-user-menu-root
				use:menu.rootAction
				onfocusout={menu.onRootFocusOut}
			>
				<button
					type="button"
					use:menu.triggerAction
					id={menu.triggerId}
					onclick={menu.onTriggerClick}
					onkeydown={menu.onTriggerKeydown}
					class="panel bar-trigger"
					class:expanded={menu.open}
					aria-haspopup="menu"
					aria-controls={menu.controlsId}
					aria-label={menu.triggerLabel}
					aria-expanded={menu.open}
					title={menu.open ? undefined : name}
				>
					<span class="badge">{initials}</span>
				</button>
				{#if menu.open}
					<div
						use:menu.bodyAction
						id={menu.bodyId}
						class="gawdux-shell-bar-sheet"
						data-account-sheet
					>
						<div class="person">
							<p class="person-name">{name}</p>
							{#if email}<p class="person-email">{email}</p>{/if}
						</div>
						<div
							class="menu"
							use:menu.menuAction
							id={menu.menuId}
							role="menu"
							tabindex="-1"
							aria-labelledby={menu.triggerId}
							onkeydown={menu.onMenuKeydown}
							onpointermove={menu.onMenuPointerMove}
							onpointerleave={menu.onMenuPointerLeave}
						>
							<div class="pair" role="none">
								{@render rows(menu)}
							</div>
							{#if themeCookieName}
								<UserMenuThemeRow
									cookieName={themeCookieName}
									label={themeLabel}
									class="gawdux-account-card-row"
								/>
							{/if}
							{@render extras?.({ close: () => menu.close() })}
						</div>
						{@render meter?.()}
						<div class="rule" aria-hidden="true"></div>
						{@render facts()}
					</div>
				{/if}
			</div>
		{:else}
			<div
				class="gawdux-account-card"
				class:compact={menu.compact}
				data-account-card="header"
				use:menu.rootAction
				onfocusout={menu.onRootFocusOut}
			>
				<!-- The spacer keeps the closed card's footprint so the header
				     holds still while the floating panel grows downward. -->
				<div class="spacer" aria-hidden="true"></div>

				<!-- The card at full size whatever it shows: the header reads its
				     full width here (createRoomYield), so a yield holds as the
				     window crosses the compact width. -->
				<div class="room-full" data-room-full aria-hidden="true"></div>

				<!-- The closed card names the person in its tooltip at every size:
				     the avatar alone, whatever made it the avatar, and a name the
				     full card cuts. The card carries it, never the trigger, so the
				     trigger's accessible name and description are unchanged. -->
				<div
					class="panel card"
					class:expanded={menu.open}
					title={menu.open ? undefined : name}
					role="presentation"
					onpointerenter={menu.clearLeave}
					onpointerleave={menu.onPanelPointerLeave}
				>
					<button
						type="button"
						use:menu.triggerAction
						id={menu.triggerId}
						onclick={menu.onTriggerClick}
						onkeydown={menu.onTriggerKeydown}
						class="trigger"
						aria-haspopup="menu"
						aria-controls={menu.controlsId}
						aria-label={menu.triggerLabel}
						aria-expanded={menu.open}
					>
						<span class="badge">{initials}</span>
						<span class="identity">
							<span class="name">{name}</span>
							{#if menu.open && email}
								<span
									in:slideFadeIn={{ duration: 180 }}
									out:slideFadeOut={{ duration: 180 }}
									class="email">{email}</span
								>
							{/if}
						</span>
						<svg class="chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path
								fill-rule="evenodd"
								d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>

					<div use:menu.bodyAction id={menu.bodyId} inert={!menu.open} class="body">
						{#if menu.open}
							<div
								in:slideFadeIn={{ duration: 180 }}
								out:slideFadeOut={{ duration: 180 }}
								class="accent"
								aria-hidden="true"
							></div>
						{/if}

						<div
							class="menu pair"
							use:menu.menuAction
							id={menu.menuId}
							role="menu"
							tabindex="-1"
							aria-labelledby={menu.triggerId}
							onkeydown={menu.onMenuKeydown}
							onpointermove={menu.onMenuPointerMove}
							onpointerleave={menu.onMenuPointerLeave}
						>
							{@render rows(menu)}
						</div>

						<div class="rule" aria-hidden="true"></div>

						{@render facts()}
					</div>
				</div>
			</div>
		{/if}
	{/snippet}
</UserMenu>

<style>
	.gawdux-account-card {
		position: relative;
		flex-shrink: 0;
		text-align: left;
	}

	/* ── In a header: the footprint, the probe and the floating panel ──── */
	.spacer,
	.room-full,
	.card {
		width: 270px;
	}
	.spacer {
		height: 45px;
		visibility: hidden;
	}
	.room-full {
		position: absolute;
		top: 0;
		right: 0;
		height: 0;
		visibility: hidden;
		pointer-events: none;
	}
	.card {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 60;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		max-height: 45px;
		overflow: hidden;
		border-radius: 0.5rem;
		transition:
			width 300ms ease-out,
			max-height 300ms ease-out,
			box-shadow 300ms ease-out,
			border-color 300ms ease-out,
			background-color 300ms ease-out;
	}
	.card.expanded {
		width: 270px;
		max-height: 360px;
	}
	/* The avatar alone: the header gave its room, or the screen is compact. */
	.compact .spacer,
	.compact .card:not(.expanded) {
		width: 45px;
	}
	@media (max-width: 1024px) {
		.spacer,
		.room-full,
		.card:not(.expanded) {
			width: 45px;
		}
	}

	/* Every header control is flat, in light and dark alike: closed, the card
	   has no surface, border or shadow of its own, the header's surface
	   showing through it, and under the pointer it takes the header's quiet
	   fill. Open in a header, it is the menu growing downward: the raised
	   surface. The border is always 1px so the surface never shifts. In the
	   phone shell's bar the menu is the sheet above it, so the open avatar
	   keeps the quiet fill. */
	.panel {
		border: 1px solid transparent;
		background-color: transparent;
	}
	.panel:not(.expanded):hover {
		background-color: var(--gawdux-header-control-hover-surface);
	}
	.panel.expanded {
		border-color: var(--gawdux-menu-surface);
		background-color: var(--gawdux-menu-surface);
		box-shadow: 0 2px 6px -1px rgb(0 0 0 / 0.12);
	}
	:global(.dark) .panel.expanded {
		box-shadow: 0 2px 6px -1px rgb(0 0 0 / 0.4);
	}
	.in-bar .panel.expanded,
	:global(.dark) .in-bar .panel.expanded {
		border-color: transparent;
		background-color: var(--gawdux-header-control-hover-surface);
		box-shadow: none;
	}

	.bar-trigger {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		border-radius: 0.5rem;
		cursor: pointer;
	}

	.trigger {
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 0.5rem 9px;
		border: 0;
		background-color: transparent;
		text-align: left;
		cursor: pointer;
	}
	.card.expanded .trigger:hover {
		background-color: var(--gawdux-surface-subtle);
	}
	.identity {
		display: flex;
		flex: 1 1 0%;
		flex-direction: column;
		align-self: stretch;
		justify-content: center;
		min-width: 0;
	}
	.name,
	.email {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1;
	}
	.name {
		font-size: 13px;
		font-weight: 500;
	}
	.email {
		margin-top: 0.25rem;
		color: var(--gawdux-text-muted);
		font-size: 11px;
	}

	/* The name, the chevron and the badge read as the side rail's own: a
	   quiet grey that turns to the accent under the pointer and open. */
	.name {
		color: var(--gawdux-text-muted);
		transition: color 500ms ease-out;
	}
	.panel:hover .name,
	.panel.expanded .name {
		color: var(--gawdux-text-accent);
	}
	.chevron {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		color: var(--gawdux-text-muted);
		transition:
			transform 200ms ease-out,
			color 150ms ease-out;
	}
	.panel.expanded .chevron {
		transform: rotate(180deg);
	}
	.panel:hover .chevron,
	.panel.expanded .chevron {
		color: var(--gawdux-text-primary);
	}
	.badge {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.5rem;
		background-color: var(--gawdux-text-muted);
		color: var(--gawdux-surface);
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.05em;
		transition: background-color 500ms ease-out;
	}
	.panel:hover .badge,
	.panel.expanded .badge {
		background-color: var(--gawdux-text-accent);
	}

	/* ── The open body ────────────────────────────────────────────────── */
	.body {
		border-top: 1px solid var(--gawdux-menu-divider);
		opacity: 0;
		transition: opacity 300ms ease-out;
	}
	.card.expanded .body {
		opacity: 1;
	}
	/* The accent between the trigger and the rows: the selected rail item's
	   own mark, so the open card reads as the person's selected surface. */
	.accent {
		height: 0.25rem;
		background-color: var(--gawdux-tab-indicator);
	}
	.menu {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.375rem;
	}
	.menu:focus {
		outline: none;
	}
	.pair {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.25rem;
	}
	.sign-out {
		display: contents;
	}
	.row,
	.menu :global(.gawdux-account-card-row) {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.375rem 0.5rem;
		border: 0;
		border-radius: 0.375rem;
		background-color: transparent;
		color: var(--gawdux-text-primary);
		font: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.25rem;
		text-decoration: none;
		cursor: pointer;
		transition: background-color 150ms ease-out;
	}
	.row {
		justify-content: center;
	}
	.row:hover,
	.row:focus,
	.menu :global(.gawdux-account-card-row:hover),
	.menu :global(.gawdux-account-card-row:focus) {
		outline: none;
		background-color: var(--gawdux-menu-item-hover);
	}
	.row.danger {
		color: var(--gawdux-text-danger);
	}
	.row :global(.gawdux-account-card-icon) {
		flex-shrink: 0;
		width: 1rem;
		height: 1rem;
	}
	.rule {
		height: 1px;
		margin-inline: 0.5rem;
		background-color: var(--gawdux-menu-divider);
	}
	.person {
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid var(--gawdux-menu-divider);
	}
	.person p {
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.25;
	}
	.person-name {
		color: var(--gawdux-text-primary);
		font-size: 13px;
		font-weight: 500;
	}
	.person-email {
		margin-top: 0.125rem;
		color: var(--gawdux-text-muted);
		font-size: 11px;
	}
	.facts {
		padding: 0.625rem 0.75rem;
	}
	.access {
		margin: 0;
		color: var(--gawdux-text-muted);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-align: center;
		text-transform: uppercase;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem;
		margin-top: 0.375rem;
	}
	.chip {
		padding: 0.125rem 0.375rem;
		border-radius: 0.375rem;
		background-color: var(--gawdux-chip-surface);
		color: var(--gawdux-text-primary);
		font-size: 11px;
		font-weight: 500;
	}
	.version {
		padding: 3px 0.75rem 0.125rem;
		background-color: var(--gawdux-chip-surface);
	}
	.version p {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--gawdux-text-muted);
		font-size: 11px;
		font-weight: 500;
		line-height: 1;
	}
	.mark {
		display: inline-flex;
		width: 1.25rem;
		height: 1.25rem;
	}
	.mark :global(img),
	.mark :global(svg) {
		width: 100%;
		height: 100%;
	}
	.version-text {
		position: relative;
		top: 1px;
	}

	@media (prefers-reduced-motion: reduce) {
		.card,
		.body,
		.name,
		.chevron,
		.badge {
			transition: none;
		}
	}
</style>
