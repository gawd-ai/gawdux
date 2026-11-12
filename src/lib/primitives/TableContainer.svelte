<script lang="ts">
	export let className = '';
	/**
	 * The container fills the height its host gives it (.page-fill): its
	 * parent and every wrapper up to the page frame become a column it
	 * shares. Pass false for a table that sits inside other content (a card,
	 * a tab body, a grid cell), where it keeps its natural size and must not
	 * turn its parent into a flex column.
	 */
	export let fill = true;
	/**
	 * The container is a card: the house edge, radius and card surface. A
	 * list that is the page's own content (ListSurface's page list) passes
	 * false: the page frame draws its panel, and the list draws none.
	 */
	export let card = true;
</script>

<div
	class="{fill ? 'page-fill ' : ''}table-container {card
		? 'border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
		: 'table-container-flat'} {className}"
>
	<slot />
</div>
