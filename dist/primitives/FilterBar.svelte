<script lang="ts">
	import ListPhoneSort from './ListPhoneSort.svelte';
	import type { ListSort } from './list-query';

	export let className = '';
	/** Set by a parent that forwards the `rail` slot (a forwarded fragment
	    makes `$$slots.rail` true even when the host left it empty). */
	export let hasRail: boolean | undefined = undefined;
	/** The register's sort, which its column heads set above the compact
	    width. At or below it, where the heads are hidden and the rows read
	    as cards, the bar draws it under the filter row as the house phone
	    sort: "Sort by", one choice per key and direction, each order worded.
	    Choosing one sets the sort at once, as a head's click does. */
	export let sort: ListSort | undefined = undefined;

	$: renderRail = hasRail ?? !!$$slots.rail;
	$: phoneSort = sort && sort.keys.length > 0 ? sort : null;
</script>

<div class="filter-bar {className}" class:filter-bar-has-sort={phoneSort !== null}>
	{#if renderRail}
		<div class="filter-bar-rail">
			<slot name="rail" />
		</div>
	{/if}
	<div class="filter-row">
		<slot />
	</div>
	{#if phoneSort}
		<ListPhoneSort sort={phoneSort} />
	{/if}
</div>
