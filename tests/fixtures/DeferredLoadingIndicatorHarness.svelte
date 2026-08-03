<script lang="ts">
	import DeferredLoadingIndicator from '../../src/lib/primitives/DeferredLoadingIndicator.svelte';

	let active = $state(true);

	export function resolve() {
		active = false;
	}
</script>

<DeferredLoadingIndicator {active} label="Loading access policy" />
