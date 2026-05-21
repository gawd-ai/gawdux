<script lang="ts">
	export let label: string;
	export let value: unknown = '';
	export let emptyText: string = '-';
	export let className = '';
	$: display = value !== null && value !== undefined && String(value).length ? value : emptyText;
</script>

<div class={className}>
	<div class="readonly-label">{label}</div>
	<div class="readonly-value">{display}</div>
</div>
