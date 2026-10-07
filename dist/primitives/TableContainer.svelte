<script lang="ts">
	export let className = '';
	/**
	 * The container is the page's content surface (`.context-surface`): it
	 * welds to the command bar and fills the height the shell gives it. Pass
	 * false for a table that sits inside other content (a card, a tab body, a
	 * grid cell), where it should keep its natural size and must not turn its
	 * parent into a flex column.
	 */
	export let surface = true;
</script>

<div
	class="{surface
		? 'context-surface '
		: ''}table-container border rounded-lg border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800 {className}"
>
	<slot />
</div>
