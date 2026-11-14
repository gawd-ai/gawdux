<!-- The whole shell as a host composes it: the rail, the drawer, the main
     column with its header, and the right column or the shell's own bar. -->
<script lang="ts">
	import AppShell from '../../../src/lib/shell/AppShell.svelte';
	import ShellHeader from '../../../src/lib/shell/ShellHeader.svelte';
	import ShellSidebar from '../../../src/lib/shell/ShellSidebar.svelte';
	import ShellNavigationDrawer from '../../../src/lib/shell/ShellNavigationDrawer.svelte';
	import ShellMainColumn from '../../../src/lib/shell/ShellMainColumn.svelte';
	import ShellRightColumn from '../../../src/lib/shell/ShellRightColumn.svelte';
	import ShellBarEnd from '../../../src/lib/shell/ShellBarEnd.svelte';
	import ShellBar from '../../../src/lib/primitives/ShellBar.svelte';
	import AccountCard from '../../../src/lib/shell/AccountCard.svelte';
	import { PERSON, RAIL, RECORD_TRAIL } from './shell-fixtures';

	let {
		right = false,
		panelOpen = false,
		covered = false,
		navigationOpen = $bindable(false),
		compact = $bindable(false)
	}: {
		/** The right column holds something. */
		right?: boolean;
		panelOpen?: boolean;
		covered?: boolean;
		navigationOpen?: boolean;
		compact?: boolean;
	} = $props();
</script>

{#snippet brand({ collapsed, drawer }: { collapsed: boolean; drawer: boolean })}
	<span data-testid="brand" data-collapsed={collapsed} data-drawer={drawer}>Example</span>
{/snippet}

{#snippet account({ compact: yields }: { compact: boolean })}
	<AccountCard {...PERSON} compact={yields} />
{/snippet}

{#snippet barAccount()}
	<AccountCard {...PERSON} themeCookieName="example.theme" />
{/snippet}

{#snippet barEnd()}
	<ShellBarEnd account={barAccount} />
{/snippet}

{#snippet sidebar()}
	<ShellSidebar
		config={RAIL}
		activeUrl="/app/documents"
		initialOpen={true}
		homeHref="/app"
		homeLabel="Example home"
		{brand}
	/>
{/snippet}

{#snippet drawer({ close }: { close: () => void })}
	<ShellNavigationDrawer
		config={RAIL}
		activeUrl="/app/documents"
		homeHref="/app"
		homeLabel="Example home"
		{brand}
		onclose={close}
	/>
{/snippet}

{#snippet header()}
	<ShellHeader
		trail={RECORD_TRAIL}
		onOpenNavigation={() => (navigationOpen = true)}
		{account}
		{...right ? {} : { themeCookieName: 'example.theme' }}
	/>
{/snippet}

{#snippet rightColumn()}
	<ShellRightColumn
		{panelOpen}
		panelWidth={368}
		themeCookieName="example.theme"
		{...covered ? { viewLabel: 'Chat' } : {}}
	>
		<div style="display:flex;height:100%;justify-content:flex-end">
			<div data-testid="panel" style="width:{panelOpen ? 368 : 0}px;overflow:hidden">Panel</div>
			<ShellBar wide="column" class="rail" data-testid="bar" end={barEnd}>
				<div data-shell-bar-group>
					<button type="button" aria-label="Show chat" style="width:2rem;height:2rem">C</button>
				</div>
			</ShellBar>
		</div>
	</ShellRightColumn>
{/snippet}

<AppShell
	bind:navigationOpen
	bind:compact
	{sidebar}
	{drawer}
	{barEnd}
	{...right ? { rightColumn } : {}}
	data-testid="shell"
>
	<ShellMainColumn {header} {covered}>
		<main data-testid="page" style="flex:1 1 0%;min-height:0">Page</main>
	</ShellMainColumn>
</AppShell>

<style>
	:global(.rail) {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 3rem;
		height: 100%;
	}
</style>
