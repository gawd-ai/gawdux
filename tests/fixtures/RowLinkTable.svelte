<script lang="ts">
	import { Table, TableBody, TableBodyRow, TableBodyCell } from 'flowbite-svelte';
	import { activateRowLink } from '../../src/lib/utils/row-link';
	export let navigate: (href: string) => unknown;
	export let open: (href: string) => unknown;
	const href = '#item-7';
	function follow(event: MouseEvent) {
		return activateRowLink(event, href, { navigate, open });
	}
</script>

<Table>
	<TableBody>
		<TableBodyRow onclick={follow} onauxclick={follow}>
			<TableBodyCell><a {href}>Item 7</a></TableBodyCell>
			<TableBodyCell><span>Row background</span></TableBodyCell>
			<TableBodyCell><button type="button">Action</button></TableBodyCell>
		</TableBodyRow>
	</TableBody>
</Table>
