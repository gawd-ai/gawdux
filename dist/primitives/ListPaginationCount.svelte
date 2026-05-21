<script lang="ts">
	export let total = 0;
	export let label = 'items';
	export let className = '';
</script>

<span class="text-sm text-gray-600 dark:text-gray-400 {className}">
	{total.toLocaleString()}
	{label}
</span>
