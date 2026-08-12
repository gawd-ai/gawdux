<!--
	Test host for CommandDrawer. Owns `open` the way a real page does, so the
	"never closes itself" case is observable: the drawer can only ASK, and this
	harness deliberately does not act on the ask.
-->
<script lang="ts">
	import CommandDrawer from '../../src/lib/primitives/CommandDrawer.svelte';

	let {
		busy = false,
		extraAttr = undefined
	}: { busy?: boolean; extraAttr?: string | undefined } = $props();

	// Starts closed and is opened through `setOpen`, never seeded from a prop.
	// Seeding `$state` from a prop earns a `state_referenced_locally` warning,
	// and this fixture should not be the one file that dirties a clean gate.
	// It also matches how a real page drives the drawer: the host owns the flag.
	let isOpen = $state(false);
	let closeCount = $state(0);

	export function setOpen(value: boolean) {
		isOpen = value;
	}

	export function closes() {
		return closeCount;
	}
</script>

<CommandDrawer
	open={isOpen}
	{busy}
	onclose={() => closeCount++}
	{...extraAttr ? { 'data-probe': extraAttr } : {}}
>
	<button type="button" data-action-cancel>Cancel</button>
	<button type="button" data-action-confirm>Confirm</button>
</CommandDrawer>
