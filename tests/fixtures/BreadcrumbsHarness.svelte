<!-- Breadcrumbs with a chip beside the current page, the way a header shows
     the page's status; `status: null` shows the trail without one. The
     trail's room report is written out for the tests to read. -->
<script lang="ts">
	import Breadcrumbs from '../../src/lib/primitives/Breadcrumbs.svelte';
	import type { BreadcrumbRoom } from '../../src/lib/primitives/breadcrumb-overflow';
	import type { BreadcrumbCrumb } from '../../src/lib/utils/url-breadcrumb';

	let {
		items,
		status = 'In force',
		moreLabel
	}: { items: BreadcrumbCrumb[]; status?: string | null; moreLabel?: string } = $props();

	let room = $state<BreadcrumbRoom | null>(null);
</script>

{#snippet chip()}<span class="chip">{status}</span>{/snippet}

<Breadcrumbs
	{items}
	{moreLabel}
	className="header-trail"
	trailing={status === null ? undefined : chip}
	bind:room
/>
<button type="button" data-testid="outside">Elsewhere</button>
<output data-testid="room">{room ? `${room.available} ${room.whole} ${room.page}` : 'none'}</output>
