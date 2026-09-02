<script lang="ts">
	import PageFeedback from './PageFeedback.svelte';
	import type { SurfaceFeedbackAction } from './PageFeedback.svelte';

	let {
		actionError = null,
		loadError = null,
		loadErrorAction = null,
		tone = 'error',
		dismissable = true,
		notice = null,
		noticeTone = 'warning',
		ondismiss
	}: {
		actionError?: string | null;
		loadError?: string | null;
		loadErrorAction?: SurfaceFeedbackAction | null;
		tone?: 'error' | 'success' | 'info';
		dismissable?: boolean;
		notice?: string | null;
		noticeTone?: 'warning' | 'info' | 'success';
		ondismiss?: () => void;
	} = $props();

	const hasLoad = $derived(Boolean(loadError?.trim()));
	const hasAction = $derived(Boolean(actionError?.trim()));
	const hasNotice = $derived(Boolean(notice?.trim()));
</script>

<!-- The strip the shells render inside the panel. A failed load comes first
     and is not dismissable (its action is the way back); a failed action is
     dismissable; a standing notice (archived, awaiting a password reset)
     comes last and stays. Styling lives in tokens.css (.surface-feedback)
     and in PageFeedback's band layout, so every shell reads the same. -->
{#if hasLoad || hasAction || hasNotice}
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
		{#if hasNotice}
			<PageFeedback layout="band" message={notice} title={null} tone={noticeTone} dismissable={false} />
		{/if}
	</div>
{/if}
