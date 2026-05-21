<script lang="ts">
	export let className = '';
</script>

<div class="filter-bar {className}">
	<div class="filter-row">
		<slot />
	</div>
</div>
