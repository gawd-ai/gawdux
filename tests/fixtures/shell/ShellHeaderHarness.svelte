<!-- The shell's header as a host draws it: its slots empty, or filled with
     the account card, a switcher and the notices. -->
<script lang="ts">
	import ShellHeader from '../../../src/lib/shell/ShellHeader.svelte';
	import AccountCard from '../../../src/lib/shell/AccountCard.svelte';
	import type { PageCrumb } from '../../../src/lib/shell/app-trail';
	import { PERSON, RECORD_TRAIL } from './shell-fixtures';

	let {
		trail = RECORD_TRAIL,
		filled = true,
		theme = true,
		onOpenNavigation = () => {}
	}: {
		trail?: PageCrumb[];
		filled?: boolean;
		theme?: boolean;
		onOpenNavigation?: () => void;
	} = $props();
</script>

{#snippet account({ compact }: { compact: boolean })}
	<AccountCard {...PERSON} {compact} />
{/snippet}

{#snippet switcher({ compact }: { compact: boolean })}
	<button type="button" data-testid="switcher" data-compact={compact}>North site</button>
{/snippet}

{#snippet notices()}
	<button type="button" data-testid="notices" aria-label="Notices" aria-haspopup="menu">N</button>
{/snippet}

<div data-testid="column" style="display:flex;min-width:0;flex:1 1 0%;flex-direction:column">
	{#if filled}
		<ShellHeader
			{trail}
			{onOpenNavigation}
			{account}
			{switcher}
			{notices}
			{...theme ? { themeCookieName: 'example.theme' } : {}}
		/>
	{:else}
		<ShellHeader {trail} {onOpenNavigation} />
	{/if}
</div>
