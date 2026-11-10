<script lang="ts">
	import UserMenu from '../../src/lib/components/UserMenu.svelte';
	import ShellBar from '../../src/lib/primitives/ShellBar.svelte';

	let { inBar = true }: { inBar?: boolean } = $props();
</script>

{#if inBar}
	<ShellBar>
		{#snippet end()}
			<UserMenu name="Ada Lovelace" email="ada@example.test" items={[{ label: 'Profile', href: '#/profile' }]} />
		{/snippet}
	</ShellBar>
{:else}
	<UserMenu name="Ada Lovelace" email="ada@example.test" items={[{ label: 'Profile', href: '#/profile' }]} />
{/if}
