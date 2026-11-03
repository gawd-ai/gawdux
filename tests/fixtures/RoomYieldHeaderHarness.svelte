<!-- A header row: a trail, a scope control and an account menu that yield
     their room to the trail, the account menu first. -->
<script lang="ts">
	import Breadcrumbs from '../../src/lib/primitives/Breadcrumbs.svelte';
	import UserMenu from '../../src/lib/components/UserMenu.svelte';
	import { createRoomYield } from '../../src/lib/utils/room-yield.svelte';
	import type { BreadcrumbRoom } from '../../src/lib/primitives/breadcrumb-overflow';
	import type { BreadcrumbCrumb } from '../../src/lib/utils/url-breadcrumb';

	let {
		items,
		scope = true,
		need = 'whole',
		compactBelow = 0
	}: {
		items: BreadcrumbCrumb[];
		scope?: boolean;
		need?: 'whole' | 'page';
		compactBelow?: 0 | 768 | 1024;
	} = $props();

	let trail = $state<BreadcrumbRoom | null>(null);
	let accountBox = $state<HTMLElement>();
	let scopeBox = $state<HTMLElement>();

	const room = createRoomYield({
		sibling: () => (trail ? { available: trail.available, need: trail[need] } : null),
		controls: () => [accountBox, scopeBox]
	});
</script>

<div class="row">
	<Breadcrumbs {items} bind:room={trail} />
	{#if scope}
		<div class="scope-box" data-yields={room.yields(1)} bind:this={scopeBox}>Scope</div>
	{/if}
	<div class="account-box" bind:this={accountBox}>
		<UserMenu name="Ada Lovelace" {compactBelow} compact={room.yields(0)} />
	</div>
</div>
