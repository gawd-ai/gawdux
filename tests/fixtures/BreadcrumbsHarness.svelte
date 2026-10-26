<!-- Breadcrumbs with a chip beside the current page, the way a header shows
     the page's status. -->
<script lang="ts">
	import Breadcrumbs from '../../src/lib/primitives/Breadcrumbs.svelte';
	import type { BreadcrumbCrumb } from '../../src/lib/utils/url-breadcrumb';

	let {
		items,
		status = 'In force',
		moreLabel
	}: { items: BreadcrumbCrumb[]; status?: string; moreLabel?: string } = $props();
</script>

<Breadcrumbs {items} {moreLabel} className="header-trail">
	{#snippet trailing()}<span class="chip">{status}</span>{/snippet}
</Breadcrumbs>
<button type="button" data-testid="outside">Elsewhere</button>
