<!--
	A bar host with one registrant per zone that can be mounted and, in the
	SAME flush, unmounted again: `EffectOnChange` sits earlier in the tree than
	the registrants, so its effect runs before theirs and closes the block that
	just mounted them. The zones render the way a host must render them,
	`{@render zone?.()}`.
-->
<script lang="ts">
	import { setContext } from 'svelte';
	import PageCommandBar from '../../src/lib/primitives/PageCommandBar.svelte';
	import PageCommandBarCenter from '../../src/lib/primitives/PageCommandBarCenter.svelte';
	import PageCommandBarRight from '../../src/lib/primitives/PageCommandBarRight.svelte';
	import PageCommandBarConfirm from '../../src/lib/primitives/PageCommandBarConfirm.svelte';
	import { createPageCommandBarRegistry } from '../../src/lib/primitives/page-command-bar-registry';
	import {
		PAGE_COMMAND_BAR_CONTEXT,
		type PageCommandBarSlots,
		type PageCommandBarZone
	} from '../../src/lib/primitives/page-chrome';
	import EffectOnChange from './EffectOnChange.svelte';

	type Transient = PageCommandBarZone | 'confirm';

	let slots = $state<PageCommandBarSlots>({ left: null, center: null, right: null });
	setContext(
		PAGE_COMMAND_BAR_CONTEXT,
		createPageCommandBarRegistry((zone, snippet) => {
			slots[zone] = snippet;
		})
	);

	let transient = $state<Transient | null>(null);
	let reloads = $state(0);
	let roles = $state(false);

	/** Mount a registrant and, in the same flush, unmount it from an earlier effect. */
	export function mountAndUnmountInOneFlush(which: Transient) {
		transient = which;
		reloads += 1;
	}

	/** Mount a registrant and let it live. */
	export function mountTransient(which: Transient | null) {
		transient = which;
	}

	export function showRoles(next: boolean) {
		roles = next;
	}
</script>

<EffectOnChange value={reloads} onchange={() => (transient = null)} />

{#if transient === 'left'}
	<PageCommandBar><button type="button">Back to vehicles</button></PageCommandBar>
{:else if transient === 'center'}
	<PageCommandBarCenter><button type="button">Retire vehicle</button></PageCommandBarCenter>
{:else if transient === 'right'}
	<PageCommandBarRight><button type="button">Next page</button></PageCommandBarRight>
{:else if transient === 'confirm'}
	<PageCommandBarConfirm
		message="Retire this vehicle?"
		confirmLabel="Retire"
		onconfirm={() => {}}
		oncancel={() => (transient = null)}
	/>
{/if}

{#if roles}
	<PageCommandBarCenter>
		<button type="button">New role</button>
		<button type="button">Archive role</button>
	</PageCommandBarCenter>
{/if}

<div data-zone="left">{@render slots.left?.()}</div>
<div data-zone="center">{@render slots.center?.()}</div>
<div data-zone="right">{@render slots.right?.()}</div>
