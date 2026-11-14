<!--
	ListPhoneSort: a register's sort as the house phone sort, drawn by
	FilterBar under its filter row (FilterBar's `sort`, which ListSurface and
	ListPageScaffold pass on). "Sort by" and one choice per key and direction,
	each order worded (A to Z, latest first: `listSortOptions`); before a key
	is chosen it reads the register's own order. Choosing one writes the
	register's sort at once, as a click on a column's head does, through the
	sort's `onsort`; it is not staged with the filters.

	It shows at or below the compact width, where a register's heads are
	hidden and its rows read as cards (tokens.css `.mobile-sort`); above it
	the heads sort and it is not drawn.
-->
<script lang="ts">
	import { listSortOptions, type ListSort } from './list-query';

	let { sort }: { sort: ListSort } = $props();

	const uid = $props.id();
	const id = `${uid}-sort`;
	const options = $derived(listSortOptions(sort.keys));
	const current = $derived(`${sort.field}:${sort.direction}`);

	function choose(event: Event) {
		const option = options.find(
			(entry) => entry.value === (event.currentTarget as HTMLSelectElement).value
		);
		if (option) sort.onsort(option.field, option.direction);
	}
</script>

<div class="mobile-sort filter-bar-sort" data-list-phone-sort>
	<label for={id} class="form-label">Sort by</label>
	<select {id} value={current} onchange={choose}>
		{#if !options.some((option) => option.value === current)}
			<!-- The register's own order, before a key is chosen. -->
			<option value={current} disabled>Default order</option>
		{/if}
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>
