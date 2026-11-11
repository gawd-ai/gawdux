<script lang="ts">
	import { setContext } from 'svelte';
	import ConfirmationCommandSurface from '../../src/lib/primitives/ConfirmationCommandSurface.svelte';
	import PageCommandBarCenter from '../../src/lib/primitives/PageCommandBarCenter.svelte';
	import { createPageCommandBarRegistry } from '../../src/lib/primitives/page-command-bar-registry';
	import { PAGE_COMMAND_BAR_CONTEXT, type PageCommandBarSlots } from '../../src/lib/primitives/page-chrome';
	import type { ConfirmationCommandSurfaceProps } from '../../src/lib/primitives/confirmation-command';

	let props: ConfirmationCommandSurfaceProps = $props();
	let slots = $state<PageCommandBarSlots>({ left: null, center: null, right: null });
	setContext(PAGE_COMMAND_BAR_CONTEXT, createPageCommandBarRegistry((zone, snippet) => {
		slots[zone] = snippet;
	}));
</script>

<PageCommandBarCenter><button data-page-edit>Edit item</button></PageCommandBarCenter>
<ConfirmationCommandSurface {...props} />
<footer data-command-bar>
	{@render slots.center?.()}
</footer>
