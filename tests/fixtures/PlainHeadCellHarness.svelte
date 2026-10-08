<!-- The plain header DataTable rendered in gawdux 0.17.0 for a column with no
     icon and no sort: the reference HeadCell is compared against. -->
<script lang="ts">
	import { TableHeadCell } from 'flowbite-svelte';

	let { label, alignClass = '', className = '' }: { label: string; alignClass?: string; className?: string } =
		$props();
</script>

<TableHeadCell class={`whitespace-nowrap ${alignClass} ${className}`}>{label}</TableHeadCell>
