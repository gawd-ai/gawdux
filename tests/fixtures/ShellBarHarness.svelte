<!-- A ShellBar as a shell holds it: an occupant's controls in a group, and
     the host's controls at its end, which read whether they sit in the bar. -->
<script lang="ts">
	import ShellBar from '../../src/lib/primitives/ShellBar.svelte';
	import ShellBarProbe from './ShellBarProbe.svelte';

	let { wide = 'hidden', occupant = true }: { wide?: 'hidden' | 'column'; occupant?: boolean } =
		$props();
</script>

<ShellBar {wide} data-testid="bar">
	{#if occupant}
		<div data-shell-bar-group>
			<button type="button">Show chat</button>
			<button type="button">Channels</button>
		</div>
		<div data-shell-bar-column></div>
	{/if}
	{#snippet end()}
		<ShellBarProbe />
		<button type="button">Account</button>
	{/snippet}
</ShellBar>
<ShellBarProbe />
