<!-- A slot consumer of BreadcrumbTrail: legacy syntax, the chip in `afterLast`. -->
<script lang="ts">
	import BreadcrumbTrail from '../../src/lib/primitives/BreadcrumbTrail.svelte';
	import type { BreadcrumbCrumb } from '../../src/lib/utils/url-breadcrumb';

	export let items: BreadcrumbCrumb[] = [];
	export let status: string | null = 'In force';
</script>

<BreadcrumbTrail {items} className="legacy-trail">
	<svelte:fragment slot="afterLast">
		{#if status}<span class="chip">{status}</span>{/if}
	</svelte:fragment>
</BreadcrumbTrail>
