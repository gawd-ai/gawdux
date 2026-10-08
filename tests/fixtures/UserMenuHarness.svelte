<script lang="ts">
	import UserMenu from '../../src/lib/components/UserMenu.svelte';
	import type { UserMenuItem } from '../../src/lib/types/user-menu.types';

	let {
		variant = 'mark',
		items = [],
		onextra
	}: {
		variant?: 'mark' | 'footer' | 'extra';
		items?: UserMenuItem[];
		onextra?: () => void;
	} = $props();
</script>

{#if variant === 'mark'}
	<UserMenu
		name="Ada Lovelace"
		email="ada@example.test"
		product="Product"
		version="v1.4 · 212"
		versionTitle="Built from abc1234"
		{items}
	>
		{#snippet mark()}<span data-testid="mark">P</span>{/snippet}
	</UserMenu>
{:else if variant === 'footer'}
	<UserMenu name="Ada Lovelace" product="Product" version="v1">
		{#snippet footer()}<span data-testid="custom-footer">Custom footer</span>{/snippet}
	</UserMenu>
{:else}
	<UserMenu name="Ada Lovelace" {items} onsignout={() => {}}>
		{#snippet extraItems({ close })}
			<button
				type="button"
				role="menuitem"
				tabindex="-1"
				class="gawdux-user-menu-item"
				onclick={() => {
					onextra?.();
					close();
				}}>Extra row</button
			>
		{/snippet}
	</UserMenu>
{/if}
<button type="button" data-testid="outside">Outside</button>
