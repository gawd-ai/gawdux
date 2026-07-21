<script lang="ts">
	import ListSurface from '../../src/lib/primitives/ListSurface.svelte';
	import type { ListPagination } from '../../src/lib/primitives/list-pagination';

	export let total = 0;
	export let cursor = false;

	$: pagination = (cursor
			? {
					mode: 'cursor',
					visibleCount: total,
					hasPrevious: false,
					hasNext: true,
					onPrevious: () => {},
					onNext: () => {}
				}
			: {
					total,
					currentPage: 1,
					totalPages: total > 0 ? 1 : 0,
					onPage: () => {}
				}) satisfies ListPagination;
</script>

<ListSurface hasActions={true} hasFooter={true} {pagination}>
	<button slot="actions" type="button">Independent action</button>
	<span slot="footer">Independent footer</span>
	<div>Rows</div>
</ListSurface>
