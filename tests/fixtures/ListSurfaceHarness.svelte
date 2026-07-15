<script lang="ts">
	import ListSurface from '../../src/lib/primitives/ListSurface.svelte';

	export let total = 0;
</script>

<ListSurface
	hasActions={true}
	hasFooter={true}
	pagination={{ total, currentPage: 1, totalPages: total > 0 ? 1 : 0, onPage: () => {} }}
>
	<button slot="actions" type="button">Independent action</button>
	<span slot="footer">Independent footer</span>
	<div>Rows</div>
</ListSurface>
