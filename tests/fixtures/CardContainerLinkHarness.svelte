<script lang="ts">
	import CardContainer from '../../src/lib/primitives/CardContainer.svelte';
	export let link: { label: string; href?: string } | null = null;
</script>

<CardContainer title="Interfaces" {link}>
	<span slot="header">2 ports</span>
	<p slot="content">body</p>
</CardContainer>
