<!-- Test harness: opens and closes the sign drawer from outside, as a host does. -->
<script lang="ts">
	import SignatureCommandSurface from '../../src/lib/validation/SignatureCommandSurface.svelte';

	let { signer }: { signer: { name: string; email: string } } = $props();
	let open = $state(true);
</script>

<button type="button" data-harness-toggle onclick={() => (open = !open)}>toggle</button>
<SignatureCommandSurface
	{open}
	title="Sign: QA review"
	statement="You are about to sign step QA review on TRF-0007 with the meaning Approved."
	{signer}
	confirmLabel="Sign QA review"
	onclose={() => (open = false)}
	onconfirm={() => {}}
/>
