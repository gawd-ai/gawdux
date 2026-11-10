<!-- Draws the page's status its host states (PAGE_STATUS_CONTEXT): a header
     that claimed it renders this where the status belongs. -->
<script lang="ts">
	import type { PageStatusHost } from './page-chrome';

	let { host }: { host: PageStatusHost } = $props();
</script>

{#if host.status}{@render host.status()}{/if}
