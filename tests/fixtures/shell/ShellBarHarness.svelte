<!-- The phone shell's one bar: an occupant's rail as a chat rail draws it
     (when `occupied`), its toggle and its foot in the bar and its views in
     the column only, then the host's controls the shell gives it. -->
<script lang="ts">
	import ShellBar from '../../../src/lib/primitives/ShellBar.svelte';
	import ShellBarEnd from '../../../src/lib/shell/ShellBarEnd.svelte';
	import AccountCard from '../../../src/lib/shell/AccountCard.svelte';
	import UserMenu from '../../../src/lib/components/UserMenu.svelte';
	import { PERSON } from './shell-fixtures';

	let {
		occupied = true,
		filled = true,
		card = true
	}: {
		/** Something occupies the bar (a chat rail). */
		occupied?: boolean;
		/** The host fills the end's slots. */
		filled?: boolean;
		/** The host opts into the account card; otherwise UserMenu's own sheet. */
		card?: boolean;
	} = $props();
</script>

{#snippet extras(menu: { close: () => void })}
	<button type="button" role="menuitem" tabindex="-1" data-testid="extra" onclick={menu.close}>
		North site
	</button>
{/snippet}

{#snippet meter()}
	<div data-testid="meter">62%</div>
{/snippet}

{#snippet notices()}
	<button type="button" aria-label="Notices (2)" aria-haspopup="menu" data-testid="notices">N</button>
{/snippet}

{#snippet account()}
	{#if card}
		<AccountCard {...PERSON} themeCookieName="example.theme" {extras} {meter} />
	{:else}
		<UserMenu
			name={PERSON.name}
			email={PERSON.email}
			items={[{ label: 'Profile', href: PERSON.profileHref }]}
			signOutAction={PERSON.signOutAction}
			theme={{ cookieName: 'example.theme' }}
		/>
	{/if}
{/snippet}

{#snippet end()}
	{#if filled}
		<ShellBarEnd {notices} {account} />
	{:else}
		<ShellBarEnd />
	{/if}
{/snippet}

<div style="display:flex">
	{#if occupied}
		<ShellBar wide="column" class="rail" data-testid="bar" {end}>
			<div class="rail-head" data-shell-bar-group>
				<button type="button" class="rail-button" aria-label="Show chat">C</button>
			</div>
			<div class="rail-views" data-shell-bar-column>
				<button type="button" class="rail-button" aria-label="Direct messages">D</button>
				<button type="button" class="rail-button" aria-label="Channels">#</button>
			</div>
			<div class="rail-spacer" data-shell-bar-column></div>
			<div class="rail-foot" data-shell-bar-group>
				<button type="button" class="rail-button" aria-label="Help">?</button>
			</div>
		</ShellBar>
	{:else}
		<ShellBar wide="hidden" data-testid="bar" {end} />
	{/if}
</div>

<style>
	:global(.rail) {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 3rem;
		height: 100vh;
	}
	.rail-head,
	.rail-foot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 3rem;
	}
	.rail-views {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.rail-spacer {
		flex: 1 1 0%;
	}
	.rail-button {
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 0;
		border-radius: 0.375rem;
		background: transparent;
	}
</style>
