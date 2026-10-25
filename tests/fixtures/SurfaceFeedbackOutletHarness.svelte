<!--
	Test host for SurfaceFeedbackOutlet: a scaffold that does not own the
	surface, a page panel holding the outlet, and optionally a second outlet in
	another panel. `active` is owned here and flipped through `setActive`, the
	way a page drives it.
-->
<script lang="ts">
	import EditablePageScaffold from '../../src/lib/primitives/EditablePageScaffold.svelte';
	import SurfaceFeedbackOutlet from '../../src/lib/primitives/SurfaceFeedbackOutlet.svelte';

	let {
		actionError = null,
		second = false
	}: { actionError?: string | null; second?: boolean } = $props();

	let active = $state(true);

	export function setActive(value: boolean) {
		active = value;
	}
</script>

<EditablePageScaffold {actionError}>
	<div data-panel="first">
		<SurfaceFeedbackOutlet {active} />
		<p>Record details</p>
	</div>
	{#if second}
		<div data-panel="second">
			<SurfaceFeedbackOutlet />
		</div>
	{/if}
</EditablePageScaffold>
