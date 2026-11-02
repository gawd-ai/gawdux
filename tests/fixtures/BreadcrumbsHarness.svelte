<!-- Breadcrumbs with a chip beside the current page, the way a header shows
     the page's status; `status: null` shows the trail without one. -->
<script lang="ts">
	import Breadcrumbs from '../../src/lib/primitives/Breadcrumbs.svelte';
	import type { BreadcrumbCrumb } from '../../src/lib/utils/url-breadcrumb';

	let {
		items,
		status = 'In force',
		moreLabel
	}: { items: BreadcrumbCrumb[]; status?: string | null; moreLabel?: string } = $props();
</script>

{#snippet chip()}<span class="chip">{status}</span>{/snippet}

<Breadcrumbs {items} {moreLabel} className="header-trail" trailing={status === null ? undefined : chip} />
<button type="button" data-testid="outside">Elsewhere</button>
