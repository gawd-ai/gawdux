<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class={className} data-testid="feedback-icon-override">!</span>
