<!-- House two-pane master-detail shell: centered card, 18rem selector rail +
     detail pane. At phone widths the shell becomes a single-pane flow: rail
     rows open detail and detail provides a focus-restoring Back control. The
     existing container-query layout remains unchanged above 48rem. -->
<script lang="ts">
	import { tick, untrack, type Snippet } from 'svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';

	let {
		rail,
		detail,
		railHeader,
		detailKey = null,
		detailLabel = 'Details'
	}: {
		rail: Snippet;
		detail: Snippet;
		/** Optional pinned zone above the rail (search/filters): stays in view
		 *  while the rail list scrolls underneath it. */
		railHeader?: Snippet;
		/** Identity of the active detail. Change this when selection or create
		 *  mode changes so compact layouts can open the new detail pane. */
		detailKey?: string | number | null;
		/** Accessible name for the compact detail region. */
		detailLabel?: string;
	} = $props();

	type MobilePane = 'rail' | 'detail';

	const initialDetailKey = untrack(() => detailKey);
	let mobilePane = $state<MobilePane>(initialDetailKey == null ? 'rail' : 'detail');
	let initialized = false;
	let previousDetailKey: string | number | null = initialDetailKey;
	let railElement: HTMLElement | undefined;
	let detailElement: HTMLElement | undefined;

	function isCompactViewport(): boolean {
		return typeof window !== 'undefined' && window.matchMedia('(max-width: 48rem)').matches;
	}

	async function focusDetail() {
		await tick();
		if (isCompactViewport()) detailElement?.focus({ preventScroll: true });
	}

	async function showDetail() {
		mobilePane = 'detail';
		await focusDetail();
	}

	async function showRail() {
		mobilePane = 'rail';
		await tick();
		if (!isCompactViewport()) return;

		const selectedRow = railElement?.querySelector<HTMLElement>(
			'[data-master-detail-row][aria-current="true"]'
		);
		const firstRow = railElement?.querySelector<HTMLElement>('[data-master-detail-row]');
		(selectedRow ?? firstRow)?.focus({ preventScroll: true });
	}

	function handleRailClick(event: MouseEvent) {
		if (!(event.target instanceof Element)) return;
		if (!event.target.closest('[data-master-detail-row]')) return;
		void showDetail();
	}

	$effect(() => {
		const element = railElement;
		if (!element) return;

		element.addEventListener('click', handleRailClick);
		return () => element.removeEventListener('click', handleRailClick);
	});

	$effect(() => {
		const nextDetailKey = detailKey;
		if (!initialized) {
			initialized = true;
			previousDetailKey = nextDetailKey;
			mobilePane = nextDetailKey == null ? 'rail' : 'detail';
			return;
		}
		if (Object.is(nextDetailKey, previousDetailKey)) return;

		previousDetailKey = nextDetailKey;
		mobilePane = nextDetailKey == null ? 'rail' : 'detail';
		if (nextDetailKey == null) void showRail();
		else void focusDetail();
	});
</script>

<div class="@container min-h-0 w-full flex-1">
	<div class="h-full min-h-0 overflow-auto p-3 @3xl:flex @3xl:flex-col @3xl:overflow-hidden">
		<div
			class="mx-auto grid min-h-[30rem] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 @3xl:min-h-0 @3xl:flex-1 @3xl:grid-cols-[18rem_minmax(0,1fr)] @3xl:grid-rows-[minmax(0,1fr)]"
		>
			<aside
				bind:this={railElement}
				data-mobile-active={mobilePane === 'rail'}
				class={`flex min-h-0 flex-col border-b border-gray-100 bg-gray-50/70 max-[769px]:border-b-0 dark:border-gray-800 dark:bg-gray-950/30 @3xl:border-b-0 @3xl:border-r ${mobilePane === 'rail' ? '' : 'max-[769px]:hidden'}`}
			>
				{#if railHeader}
					<div class="shrink-0 bg-gray-100/70 p-2 dark:bg-gray-900/50">
						{@render railHeader()}
					</div>
				{/if}
				<div
					class="max-h-80 min-h-0 flex-1 overflow-y-auto p-2 max-[769px]:max-h-none @3xl:max-h-none"
				>
					{@render rail()}
				</div>
			</aside>
			<section
				bind:this={detailElement}
				data-mobile-active={mobilePane === 'detail'}
				tabindex="-1"
				aria-label={detailLabel}
				class={`min-w-0 space-y-3 p-3 focus:outline-none @3xl:min-h-0 @3xl:overflow-y-auto ${mobilePane === 'detail' ? '' : 'max-[769px]:hidden'}`}
			>
				<button
					type="button"
					class="hidden min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 max-[769px]:inline-flex dark:text-gray-200 dark:hover:bg-gray-800"
					onclick={showRail}
				>
					<ArrowLeftOutline class="h-4 w-4" aria-hidden="true" />
					Back to list
				</button>
				{@render detail()}
			</section>
		</div>
	</div>
</div>
