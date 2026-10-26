<!--
	@component
	Breadcrumbs for a consumer written with slots: the same one-line trail,
	folding and menu, with the `afterLast` slot riding beside the current page
	as Breadcrumbs' `trailing`. New code uses Breadcrumbs and its snippet.
-->
<script lang="ts">
	import Breadcrumbs from './Breadcrumbs.svelte';
	import type { BreadcrumbCrumb } from '../utils/url-breadcrumb';

	export let items: BreadcrumbCrumb[] = [];
	export let className: string = 'h-12';
</script>

{#if $$slots.afterLast}
	<Breadcrumbs {items} {className}>
		{#snippet trailing()}<slot name="afterLast" />{/snippet}
	</Breadcrumbs>
{:else}
	<Breadcrumbs {items} {className} />
{/if}
