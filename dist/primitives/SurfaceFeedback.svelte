<script lang="ts">
	import PageFeedback from './PageFeedback.svelte';
	import type { SurfaceFeedbackAction } from './PageFeedback.svelte';

	let {
		actionError = null,
		loadError = null,
		loadErrorAction = null,
		tone = 'error',
		dismissable = true,
		ondismiss
	}: {
		actionError?: string | null;
		loadError?: string | null;
		loadErrorAction?: SurfaceFeedbackAction | null;
		tone?: 'error' | 'success' | 'info';
		dismissable?: boolean;
		ondismiss?: () => void;
	} = $props();

	const hasLoad = $derived(Boolean(loadError?.trim()));
	const hasAction = $derived(Boolean(actionError?.trim()));
</script>

<!-- The strip the shells render inside the panel. A failed load comes first
     and is not dismissable (its action is the way back); a failed action is
     dismissable. Styling lives in tokens.css (.surface-feedback) and in
     PageFeedback's band layout, so every shell reads the same. -->
{#if hasLoad || hasAction}
	<div class="surface-feedback">
		{#if hasLoad}
			<PageFeedback
				layout="band"
				message={loadError}
				title={null}
				tone="error"
				dismissable={false}
				actionLabel={loadErrorAction?.label ?? null}
				actionHref={loadErrorAction?.href ?? null}
			/>
		{/if}
		{#if hasAction}
			<PageFeedback
				layout="band"
				message={actionError}
				title={null}
				{tone}
				{dismissable}
				{ondismiss}
			/>
		{/if}
	</div>
{/if}
