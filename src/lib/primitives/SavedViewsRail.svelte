<!-- The saved-views rail: [All] [view] [view] ... [Save view]. One pill row
     above a list's filter fields. Selecting a pill applies its query; the
     trailing pill becomes an inline name field while the current query is
     unsaved (Enter saves, Escape cancels); the pressed saved pill carries an
     immediate delete. Presentation only: the host persists and reports
     success through the two promise-returning callbacks. -->
<script module lang="ts">
	import type { SavedViewSummary } from './saved-views';

	export interface SavedViewsRailProps {
		views: readonly SavedViewSummary[];
		/** The list's applied query: URL param name to value, defaults omitted. */
		current: Record<string, string>;
		/** A pill was chosen; null is the All pill (the default query). */
		onSelect: (view: SavedViewSummary | null) => void;
		/** Save the current query under `name`; resolve true on success. */
		onSave: (name: string) => Promise<boolean>;
		/** Delete a view; resolve true on success. */
		onDelete: (view: SavedViewSummary) => Promise<boolean>;
		/** Prefilled into the name field when the save control opens. */
		suggestedName?: string;
		/** The host's last failure; carried on the name field while it stands. */
		error?: string | null;
		allLabel?: string;
		saveLabel?: string;
		namePlaceholder?: string;
		ariaLabel?: string;
		maxNameLength?: number;
		className?: string;
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { BookmarkOutline } from 'flowbite-svelte-icons';
	import FilterPillRow, { filterPillClass, type FilterPill } from './FilterPillRow.svelte';
	import { savedViewMatch } from './saved-views';

	let {
		views,
		current,
		onSelect,
		onSave,
		onDelete,
		suggestedName = '',
		error = null,
		allLabel = 'All',
		saveLabel = 'Save view',
		namePlaceholder = 'View name',
		ariaLabel = 'Saved views',
		maxNameLength = 120,
		className = ''
	}: SavedViewsRailProps = $props();

	const ALL_ID = '';

	let editing = $state(false);
	let name = $state('');
	let invalid = $state(false);
	let pending = $state(false);
	let inputEl: HTMLInputElement | null = $state(null);

	const match = $derived(savedViewMatch(current, views));
	const pills = $derived<FilterPill[]>([
		{ id: ALL_ID, label: allLabel },
		...views.map((view) => ({ id: view.id, label: view.name }))
	]);
	const selected = $derived(match.isDefault ? ALL_ID : match.activeId);
	const showError = $derived(Boolean(error) || invalid);

	// The save control only exists while the query is unsaved; when it stops
	// being so (a save landed, a pill was chosen) the editor goes with it.
	$effect(() => {
		if (!match.canSave && editing) {
			editing = false;
			invalid = false;
		}
	});

	async function openEditor() {
		name = suggestedName;
		invalid = false;
		editing = true;
		await tick();
		inputEl?.focus();
		inputEl?.select();
	}

	function cancel() {
		editing = false;
		invalid = false;
	}

	async function submit() {
		const trimmed = name.trim();
		if (!trimmed) {
			invalid = true;
			return;
		}
		pending = true;
		try {
			const ok = await onSave(trimmed);
			if (ok) cancel();
			else invalid = true;
		} finally {
			pending = false;
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (!pending) void submit();
		} else if (event.key === 'Escape') {
			// The page may listen for Escape at the window (a menu, a drawer);
			// an open name field owns the key.
			event.preventDefault();
			event.stopPropagation();
			if (!pending) cancel();
		}
	}

	function onBlur() {
		if (!pending && name.trim() === '') cancel();
	}

	function select(id: string) {
		if (id === ALL_ID) {
			onSelect(null);
			return;
		}
		const view = views.find((candidate) => candidate.id === id);
		if (view) onSelect(view);
	}

	async function remove(pill: FilterPill) {
		const view = views.find((candidate) => candidate.id === pill.id);
		if (!view || pending) return;
		pending = true;
		try {
			await onDelete(view);
		} finally {
			pending = false;
		}
	}
</script>

{#snippet trailing()}
	{#if match.canSave}
		{#if editing}
			<input
				bind:this={inputEl}
				type="text"
				class={`${filterPillClass(true)} w-40 font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500`}
				bind:value={name}
				placeholder={namePlaceholder}
				maxlength={maxNameLength}
				aria-label={saveLabel}
				aria-invalid={showError}
				aria-busy={pending}
				title={error ?? undefined}
				disabled={pending}
				oninput={() => (invalid = false)}
				onkeydown={onKeydown}
				onblur={onBlur}
			/>
		{:else}
			<button
				type="button"
				class={`${filterPillClass(false)} inline-flex items-center gap-1`}
				disabled={pending}
				onclick={openEditor}
			>
				<BookmarkOutline class="h-3.5 w-3.5" />
				{saveLabel}
			</button>
		{/if}
	{/if}
{/snippet}

<FilterPillRow
	{pills}
	{selected}
	onSelect={select}
	onRemove={selected === ALL_ID ? undefined : remove}
	removeLabel={(pill) => `Delete view ${pill.label}`}
	{ariaLabel}
	disabled={pending}
	className={`saved-views-rail ${className}`}
	{trailing}
/>
