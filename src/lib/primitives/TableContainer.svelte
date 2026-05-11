<script lang="ts">
	export let className = '';
</script>

<div
	class="context-surface table-container border rounded-lg border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800 {className}"
>
	<slot />
</div>
