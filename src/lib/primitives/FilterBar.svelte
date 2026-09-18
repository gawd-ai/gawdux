<script lang="ts">
	export let className = '';
	/** Set by a parent that forwards the `rail` slot (a forwarded fragment
	    makes `$$slots.rail` true even when the host left it empty). */
	export let hasRail: boolean | undefined = undefined;

	$: renderRail = hasRail ?? !!$$slots.rail;
</script>

<div class="filter-bar {className}">
	{#if renderRail}
		<div class="filter-bar-rail">
			<slot name="rail" />
		</div>
	{/if}
	<div class="filter-row">
		<slot />
	</div>
</div>
