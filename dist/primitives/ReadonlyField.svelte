<script lang="ts">
	export let label: string;
	export let value: unknown = '';
	export let emptyText: string = '-';
	$: display = value !== null && value !== undefined && String(value).length ? value : emptyText;
</script>

<div>
	<div class="readonly-label">{label}</div>
	<div class="readonly-value">{display}</div>
</div>
