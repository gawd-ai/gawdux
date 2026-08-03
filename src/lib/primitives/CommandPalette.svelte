<!--
    Ctrl/Cmd+K command palette. The palette owns presentation, keyboard
    navigation and the global shortcut; consumers own the content: static
    `items` (navigation entries) plus an optional async `search` source whose
    results are debounced and shown above the matching static items.
-->
<script module lang="ts">
	export interface CommandPaletteItem {
		label: string;
		hint?: string;
		href: string;
		/** Optional 24×24 outline SVG path drawn beside the label; falls back
		 * to a generic page icon. */
		iconPath?: string;
	}

	const PAGE_ICON_PATH =
		'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	let {
		open = $bindable(false),
		items = [],
		search,
		placeholder = 'Search…',
		label = 'Command palette',
		globalShortcut = true,
		maxResults = 10,
		searchDebounceMs = 200,
		minSearchLength = 2,
		onnavigate
	}: {
		open?: boolean;
		items?: readonly CommandPaletteItem[];
		search?: (query: string) => Promise<readonly CommandPaletteItem[]>;
		placeholder?: string;
		label?: string;
		globalShortcut?: boolean;
		maxResults?: number;
		searchDebounceMs?: number;
		minSearchLength?: number;
		onnavigate?: (item: CommandPaletteItem) => void;
	} = $props();

	let query = $state('');
	let inputEl = $state<HTMLInputElement | undefined>();
	let selectedIdx = $state(0);
	let searchResults = $state<readonly CommandPaletteItem[]>([]);
	let searchToken = 0;

	$effect(() => {
		if (!open) return;
		query = '';
		selectedIdx = 0;
		searchResults = [];
		const timer = setTimeout(() => inputEl?.focus(), 50);
		return () => clearTimeout(timer);
	});

	const results = $derived.by(() => {
		const ql = query.toLowerCase().trim();
		if (!ql) return [...items];
		const staticMatches = items.filter(
			(item) =>
				item.label.toLowerCase().includes(ql) || (item.hint ?? '').toLowerCase().includes(ql)
		);
		return [...searchResults, ...staticMatches].slice(0, maxResults);
	});

	$effect(() => {
		const current = query;
		const token = ++searchToken;
		if (!search || current.toLowerCase().trim().length < minSearchLength) {
			searchResults = [];
			return;
		}
		const timer = setTimeout(async () => {
			try {
				const found = await search(current);
				if (token === searchToken) searchResults = found;
			} catch {
				/* a failed search source keeps the static items usable */
			}
		}, searchDebounceMs);
		return () => clearTimeout(timer);
	});

	function navigate(item: CommandPaletteItem) {
		open = false;
		if (onnavigate) onnavigate(item);
		else void goto(item.href);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIdx = Math.min(selectedIdx + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIdx = Math.max(selectedIdx - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const item = results[selectedIdx];
			if (item) navigate(item);
		}
	}

	// Global shortcut: Ctrl+K / Cmd+K
	$effect(() => {
		if (!globalShortcut) return;
		const handleGlobalKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				open = !open;
			}
		};
		window.addEventListener('keydown', handleGlobalKey);
		return () => window.removeEventListener('keydown', handleGlobalKey);
	});
</script>

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
		role="dialog"
		aria-modal="true"
		aria-label={label}
		tabindex="-1"
		transition:fade={{ duration: 100 }}
		onclick={(e) => {
			if (e.target === e.currentTarget) open = false;
		}}
	>
		<div
			class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
		>
			<!-- Search input -->
			<div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
				<svg
					class="w-5 h-5 text-gray-400 shrink-0"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
					/>
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					onkeydown={handleKeydown}
					{placeholder}
					aria-label={placeholder}
					class="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 p-0"
				/>
				<kbd
					class="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
					>ESC</kbd
				>
			</div>

			<!-- Results -->
			{#if results.length > 0}
				<ul class="max-h-72 overflow-y-auto py-1" role="listbox" aria-label="Search results">
					{#each results as item, i}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<li
							class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
								{i === selectedIdx ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
							onclick={() => navigate(item)}
							onmouseenter={() => (selectedIdx = i)}
							role="option"
							aria-selected={i === selectedIdx}
						>
							<svg
								class="w-4 h-4 text-gray-400 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d={item.iconPath ?? PAGE_ICON_PATH}
								/>
							</svg>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium text-gray-900 dark:text-white truncate">
									{item.label}
								</div>
								{#if item.hint}
									<div class="text-xs text-gray-400 truncate">{item.hint}</div>
								{/if}
							</div>
							{#if i === selectedIdx}
								<kbd class="text-[10px] font-mono text-gray-400">Enter</kbd>
							{/if}
						</li>
					{/each}
				</ul>
			{:else if query.length > 0}
				<div class="py-8 text-center text-sm text-gray-400">No results found</div>
			{/if}

			<!-- Footer -->
			<div
				class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-[10px] text-gray-400"
			>
				<span
					><kbd class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">↑↓</kbd> navigate</span
				>
				<span><kbd class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">↵</kbd> select</span>
				<span><kbd class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">esc</kbd> close</span>
			</div>
		</div>
	</div>
{/if}
