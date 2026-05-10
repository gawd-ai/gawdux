<script lang="ts">
	export let value: string | Date | null | undefined;

	function formatDate(v: string | Date | null | undefined): string {
		if (!v) return '';
		const d = v instanceof Date ? v : new Date(v);
		if (isNaN(d.getTime())) return '';
		// Timezone-safe: keep date-only strings as authored, otherwise use UTC date.
		return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
			? v
			: d.toISOString().slice(0, 10);
	}
</script>

<span>{formatDate(value)}</span>
