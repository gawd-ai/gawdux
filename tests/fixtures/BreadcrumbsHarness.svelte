<!-- Breadcrumbs as a header shows it. The trail's room report is written out
     for the tests to read. -->
<script lang="ts">
	import Breadcrumbs from '../../src/lib/primitives/Breadcrumbs.svelte';
	import type { BreadcrumbRoom } from '../../src/lib/primitives/breadcrumb-overflow';
	import type { BreadcrumbCrumb } from '../../src/lib/utils/url-breadcrumb';

	let {
		items,
		moreLabel,
		layout
	}: { items: BreadcrumbCrumb[]; moreLabel?: string; layout?: 'adaptive' | 'line' } = $props();

	let room = $state<BreadcrumbRoom | null>(null);
</script>

<Breadcrumbs {items} {moreLabel} {layout} className="header-trail" bind:room />
<button type="button" data-testid="outside">Elsewhere</button>
<output data-testid="room">{room ? `${room.available} ${room.whole} ${room.page}` : 'none'}</output>
