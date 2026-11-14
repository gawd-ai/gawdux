<!-- A shell whose host does not opt into the account card: UserMenu in the
     header and again at the bar's end, neither given an id. Both are in the
     page at every width. -->
<script lang="ts">
	import AppShell from '../../../src/lib/shell/AppShell.svelte';
	import ShellHeader from '../../../src/lib/shell/ShellHeader.svelte';
	import ShellMainColumn from '../../../src/lib/shell/ShellMainColumn.svelte';
	import ShellBarEnd from '../../../src/lib/shell/ShellBarEnd.svelte';
	import UserMenu from '../../../src/lib/components/UserMenu.svelte';
	import { PERSON, RECORD_TRAIL } from './shell-fixtures';

	let { ids = false }: { /** The host names both menus itself. */ ids?: boolean } = $props();

	const menu = {
		name: PERSON.name,
		email: PERSON.email,
		items: [{ label: 'Profile', href: PERSON.profileHref }],
		signOutAction: PERSON.signOutAction
	};
</script>

{#snippet account({ compact }: { compact: boolean })}
	<UserMenu {...menu} {compact} {...ids ? { id: 'example-account' } : {}} />
{/snippet}

{#snippet barAccount()}
	<UserMenu
		{...menu}
		theme={{ cookieName: 'example.theme' }}
		{...ids ? { id: 'example-account-bar' } : {}}
	/>
{/snippet}

{#snippet barEnd()}
	<ShellBarEnd account={barAccount} />
{/snippet}

{#snippet header()}
	<ShellHeader trail={RECORD_TRAIL} onOpenNavigation={() => {}} {account} />
{/snippet}

<AppShell {barEnd}>
	<ShellMainColumn {header}>
		<main>Page</main>
	</ShellMainColumn>
</AppShell>
