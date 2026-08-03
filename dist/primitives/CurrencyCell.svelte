<script lang="ts">
	let {
		value,
		currency = 'CAD',
		locale = 'en-CA'
	}: {
		value: number | string;
		currency?: string;
		locale?: string;
	} = $props();

	const amount = $derived(typeof value === 'string' ? Number(value) : value);
	const formatted = $derived(
		isNaN(Number(amount))
			? ''
			: new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(amount ?? 0))
	);
</script>

<span>{formatted}</span>
