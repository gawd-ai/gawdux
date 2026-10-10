<!-- Knowledge interaction only. Hosts retain source policy, authority, routes and history. -->
<script
	lang="ts"
	generics="KnowledgeId extends string | number = number, SourceId extends string | number = number, ResourceId extends string | number = number, Knowledge extends AiKnowledgeBase<KnowledgeId> = AiKnowledgeBase<KnowledgeId>"
>
	import { onDestroy } from 'svelte';
	import { Button, Input, Textarea } from 'flowbite-svelte';
	import {
		FileLinesOutline,
		RefreshOutline,
		TrashBinOutline,
		UploadOutline
	} from 'flowbite-svelte-icons';
	import CardContainer from '../primitives/CardContainer.svelte';
	import MasterDetailShell from '../primitives/MasterDetailShell.svelte';
	import RailRowButton from '../primitives/RailRowButton.svelte';
	import SearchInput from '../primitives/SearchInput.svelte';
	import { SEARCH_SCHEDULE_DELAY_MS } from '../utils/cancellable-scheduler';
	import type {
		AiKnowledgeBase,
		AiKnowledgePanelProps,
		AiKnowledgeResource,
		AiKnowledgeSource,
		AiKnowledgeTone,
		AiKnowledgeUsageIntent
	} from './knowledge-types';

	let {
		model,
		actions,
		editorDirty = $bindable(false),
		editorBusy = $bindable(false),
		history,
		guideId
	}: AiKnowledgePanelProps<KnowledgeId, SourceId, ResourceId, Knowledge> = $props();
	let root = $state<HTMLDivElement>();
	let alive = true;
	const knowledgeBases = $derived(model?.knowledgeBases ?? []);
	const selectedKbId = $derived(model?.selectedKnowledgeId ?? null);
	const limits = $derived(model?.limits);
	const usage = $derived(model?.usage ?? null);
	let search = $state('');
	let creating = $state(false);

	// Only a new source projection or selection supersedes an action response.
	// A refreshed base list must not erase locally settled source content.
	let rows = $state<AiKnowledgeSource<SourceId>[]>([]);
	let seededSources: readonly AiKnowledgeSource<SourceId>[] | undefined;
	let seededSourceKb: KnowledgeId | null | undefined;
	$effect(() => {
		const next = model?.sources;
		if (seededSources === next && seededSourceKb === selectedKbId) return;
		seededSources = next;
		seededSourceKb = selectedKbId;
		rows = next?.slice() ?? [];
	});

	const filtered = $derived(
		search.trim()
			? knowledgeBases.filter((kb) => kb.name.toLowerCase().includes(search.trim().toLowerCase()))
			: knowledgeBases
	);
	const selected = $derived(knowledgeBases.find((kb) => kb.id === selectedKbId) ?? null);

	// ---- Detail working copy (dirty-tracked; save is explicit) ----
	let editName = $state('');
	let editDescription = $state('');
	let saving = $state(false);
	let deletingKb = $state(false);
	let actionError = $state<string | null>(null);
	let confirmingDeleteKb = $state(false);
	// Per-row in-place strips (no modals).
	let confirmingRemoveId = $state<SourceId | null>(null);
	let busySourceId = $state<SourceId | null>(null);
	// Add-source strips.
	let addMode = $state<'none' | 'resource' | 'upload'>('none');
	let resourceSearch = $state('');
	let resourceResults = $state<AiKnowledgeResource<ResourceId>[]>([]);
	let resourceLoading = $state(false);
	let resourceSearchTimer: ReturnType<typeof setTimeout> | null = null;
	let resourceSearchController: AbortController | null = null;
	let resourceSearchRequest = 0;
	let uploadFiles = $state<FileList | null>(null);
	let uploading = $state(false);
	let addingResource = $state(false);

	// Reseed drafts only when the selection (or create mode) actually changes —
	// an unrelated refresh must never clobber typed-but-unsaved input.
	let seededKbId: KnowledgeId | null | undefined;
	let seededCreating = false;
	$effect(() => {
		const kb = selected;
		const isCreating = creating;
		if (seededKbId === (kb?.id ?? null) && seededCreating === isCreating) return;
		seededKbId = kb?.id ?? null;
		seededCreating = isCreating;
		actionError = null;
		confirmingDeleteKb = false;
		confirmingRemoveId = null;
		cancelResourceSearch();
		addMode = 'none';
		resourceSearch = '';
		resourceResults = [];
		uploadFiles = null;
		if (isCreating) {
			editName = '';
			editDescription = '';
		} else if (kb) {
			editName = kb.name;
			editDescription = kb.description;
		}
	});

	const dirty = $derived(
		creating
			? editName.trim().length > 0 || editDescription.trim().length > 0
			: selected != null && (editName !== selected.name || editDescription !== selected.description)
	);
	const navigationDirty = $derived(dirty || (uploadFiles?.length ?? 0) > 0);
	const nameValid = $derived(
		editName.trim().length > 0 && editName.trim().length <= (limits?.nameMaxChars ?? 0)
	);
	const descriptionValid = $derived(
		editDescription.trim().length <= (limits?.descriptionMaxChars ?? 0)
	);
	const sourceCapReached = $derived(
		selected != null && selected.rollup.sourceCount >= (limits?.maxSourcesPerBase ?? 0)
	);
	const sourceWriteBusy = $derived(busySourceId != null || addingResource);
	const writeBusy = $derived(saving || deletingKb || sourceWriteBusy || uploading);
	$effect(() => {
		editorDirty = navigationDirty;
		editorBusy = writeBusy;
	});

	async function navigateToKb(id: KnowledgeId) {
		if (writeBusy || !model) return;
		await actions.navigate(id);
		if (alive) creating = false;
	}

	function selectKb(id: KnowledgeId) {
		if (writeBusy) return;
		if (!creating && selected?.id === id) return;
		if (navigationDirty) {
			actions.requestDiscard({
				message: 'Discard the unsaved knowledge-base changes and open another knowledge base?',
				confirmLabel: 'Discard and open knowledge base',
				continue: () => navigateToKb(id),
				focusAfter: () =>
					root?.querySelector<HTMLElement>('[aria-label="Knowledge base details"]') ?? null
			});
			return;
		}
		void navigateToKb(id).catch(() => undefined);
	}

	function openUsage(event: MouseEvent, intent: AiKnowledgeUsageIntent) {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		)
			return;
		event.preventDefault();
		if (writeBusy || !model) return;
		if (navigationDirty && usage) {
			actions.requestDiscard({
				message: usage.discardMessage,
				confirmLabel: usage.discardConfirmLabel,
				continue: () => actions.navigateUsage(intent),
				focusAfter: actions.usageFocusTarget
			});
			return;
		}
		void actions.navigateUsage(intent).catch(() => undefined);
	}

	function startNewKnowledgeBase() {
		if (!model || knowledgeBases.length >= (limits?.maxKnowledgeBases ?? 0) || writeBusy) return;
		if (creating) {
			cancelResourceSearch();
			actionError = null;
			confirmingDeleteKb = false;
			confirmingRemoveId = null;
			addMode = 'none';
			resourceSearch = '';
			resourceResults = [];
			uploadFiles = null;
			editName = '';
			editDescription = '';
			return;
		}
		creating = true;
	}

	/** Called by the page command bar ("New knowledge base"). */
	export function openCreate() {
		if (!model || knowledgeBases.length >= (limits?.maxKnowledgeBases ?? 0) || writeBusy) return;
		if (navigationDirty) {
			actions.requestDiscard({
				message: 'Discard the unsaved knowledge-base changes and start a new knowledge base?',
				confirmLabel: 'Discard and start new knowledge base',
				continue: startNewKnowledgeBase,
				focusAfter: () => root?.querySelector<HTMLElement>('#kb-name') ?? null
			});
			return;
		}
		startNewKnowledgeBase();
	}

	function statusPill(kb: Knowledge): { label: string; cls: string } {
		const r = kb.rollup;
		if (r.sourceCount === 0)
			return {
				label: 'Empty',
				cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
			};
		if (r.errorCount > 0)
			return {
				label: `${r.errorCount} ${r.errorCount === 1 ? 'error' : 'errors'}`,
				cls: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
			};
		if (r.unavailableCount > 0)
			return {
				label: `${r.unavailableCount} unavailable`,
				cls: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
			};
		if (r.ingestingCount > 0)
			return {
				label: 'Ingesting',
				cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
			};
		if (r.staleCount > 0)
			return {
				label: `${r.staleCount} stale`,
				cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
			};
		return {
			label: 'Ready',
			cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
		};
	}

	function toneClass(tone: AiKnowledgeTone): string {
		switch (tone) {
			case 'ready':
				return 'text-emerald-600 dark:text-emerald-400';
			case 'error':
				return 'text-red-600 dark:text-red-400';
			case 'warning':
				return 'font-medium text-amber-600 dark:text-amber-400';
			case 'working':
				return 'text-blue-600 dark:text-blue-400';
			default:
				return 'text-gray-400 dark:text-gray-500';
		}
	}

	async function saveKb() {
		if (!model || saving || deletingKb || !nameValid || !descriptionValid) return;
		const kbId = selected?.id ?? null;
		saving = true;
		actionError = null;
		try {
			if (creating) {
				const created = await actions.create({
					name: editName,
					description: editDescription
				});
				if (!alive || !model || !creating) return;
				actions.knowledgeBasesChanged([...knowledgeBases, created]);
				creating = false;
				await actions.navigate(created.id);
			} else if (kbId != null) {
				const updated = await actions.update(kbId, {
					name: editName,
					description: editDescription
				});
				if (!alive || !model) return;
				actions.knowledgeBasesChanged(
					knowledgeBases.map((kb) => (kb.id === updated.id ? updated : kb))
				);
				if (selected?.id === kbId) seededKbId = undefined;
				await actions.refreshKnowledgeBases();
			}
		} catch (err) {
			if (alive && model != null && (creating || selected?.id === kbId)) {
				actionError = actions.errorMessage(err, 'Could not save the knowledge base.');
			}
		} finally {
			saving = false;
		}
	}

	function discard() {
		if (creating) {
			creating = false;
			return;
		}
		if (!selected) return;
		editName = selected.name;
		editDescription = selected.description;
		actionError = null;
		confirmingDeleteKb = false;
	}

	async function confirmDeleteKb() {
		if (!selected || deletingKb) return;
		const kbId = selected.id;
		deletingKb = true;
		actionError = null;
		try {
			await actions.delete(kbId);
			if (!alive || !model) return;
			actions.knowledgeBasesChanged(knowledgeBases.filter((kb) => kb.id !== kbId));
			confirmingDeleteKb = false;
			if (selected?.id === kbId || selected == null) await actions.navigate();
		} catch (err) {
			if (alive && model != null && selected?.id === kbId) {
				confirmingDeleteKb = false;
				actionError = actions.errorMessage(err, 'Could not delete the knowledge base.');
			}
		} finally {
			deletingKb = false;
		}
	}

	async function openResourcePicker() {
		if (writeBusy) return;
		addMode = addMode === 'resource' ? 'none' : 'resource';
		if (addMode === 'resource') await searchResources();
		else cancelResourceSearch();
	}

	function toggleUploadPicker() {
		if (writeBusy) return;
		if (addMode === 'upload') {
			uploadFiles = null;
			addMode = 'none';
			return;
		}
		cancelResourceSearch();
		uploadFiles = null;
		addMode = 'upload';
	}

	function cancelUpload() {
		if (uploading) return;
		uploadFiles = null;
		addMode = 'none';
	}

	function cancelResourceSearch() {
		if (resourceSearchTimer) clearTimeout(resourceSearchTimer);
		resourceSearchTimer = null;
		resourceSearchController?.abort();
		resourceSearchController = null;
		resourceSearchRequest += 1;
		resourceLoading = false;
	}

	function scheduleResourceSearch() {
		cancelResourceSearch();
		resourceLoading = true;
		resourceSearchTimer = setTimeout(() => {
			resourceSearchTimer = null;
			void searchResources();
		}, SEARCH_SCHEDULE_DELAY_MS);
	}

	async function searchResources() {
		if (!selected) return;
		const kbId = selected.id;
		if (resourceSearchTimer) clearTimeout(resourceSearchTimer);
		resourceSearchTimer = null;
		resourceSearchController?.abort();
		const controller = new AbortController();
		resourceSearchController = controller;
		const request = ++resourceSearchRequest;
		resourceLoading = true;
		try {
			const result = await actions.searchResources({
				knowledgeId: kbId,
				search: resourceSearch,
				signal: controller.signal
			});
			if (
				request === resourceSearchRequest &&
				alive &&
				model != null &&
				selected?.id === kbId &&
				addMode === 'resource'
			) {
				resourceResults = result;
			}
		} catch (err) {
			if (!actions.isAbortError(err) && request === resourceSearchRequest) {
				actionError = actions.errorMessage(
					err,
					model?.sourcePolicy.searchErrorMessage ?? 'Could not load sources.'
				);
			}
		} finally {
			if (request === resourceSearchRequest) {
				resourceLoading = false;
				resourceSearchController = null;
			}
		}
	}

	onDestroy(() => {
		alive = false;
		cancelResourceSearch();
	});

	async function addResource(row: AiKnowledgeResource<ResourceId>) {
		if (!selected || sourceWriteBusy || uploading || sourceCapReached) return;
		const kbId = selected.id;
		actionError = null;
		addingResource = true;
		try {
			const source = await actions.addResource(kbId, row.id);
			if (alive && model != null && selected?.id === kbId && !creating) {
				rows = [...rows, source];
				resourceResults = resourceResults.filter((candidate) => candidate.id !== row.id);
			}
			await actions.refreshKnowledgeBases();
		} catch (err) {
			if (alive && model != null && selected?.id === kbId) {
				actionError = actions.errorMessage(
					err,
					model?.sourcePolicy.addErrorMessage ?? 'Could not add the source.'
				);
			}
		} finally {
			addingResource = false;
		}
	}

	async function uploadFile() {
		const file = uploadFiles?.[0];
		if (!selected || !file || uploading || sourceWriteBusy || sourceCapReached) return;
		const kbId = selected.id;
		const uploadError = actions.validateUpload(file);
		if (uploadError) {
			actionError = uploadError;
			return;
		}
		uploading = true;
		actionError = null;
		try {
			const source = await actions.upload(kbId, file);
			if (alive && model != null && selected?.id === kbId && !creating) {
				rows = [...rows, source];
				uploadFiles = null;
				addMode = 'none';
			}
			await actions.refreshKnowledgeBases();
		} catch (err) {
			if (alive && model != null && selected?.id === kbId) {
				actionError = actions.errorMessage(err, 'Could not upload the file.');
			}
		} finally {
			uploading = false;
		}
	}

	async function reingest(source: AiKnowledgeSource<SourceId>) {
		if (sourceWriteBusy || uploading) return;
		const kbId = selected?.id ?? null;
		if (kbId == null) return;
		busySourceId = source.id;
		actionError = null;
		try {
			const updated = await actions.refreshSource(source.id);
			if (alive && model != null && selected?.id === kbId) {
				rows = rows.map((candidate) => (candidate.id === updated.id ? updated : candidate));
			}
			await actions.refreshKnowledgeBases();
		} catch (err) {
			if (alive && model != null && selected?.id === kbId) {
				actionError = actions.errorMessage(err, 'Could not re-ingest the source.');
			}
		} finally {
			busySourceId = null;
		}
	}

	async function confirmRemove(source: AiKnowledgeSource<SourceId>) {
		if (sourceWriteBusy || uploading) return;
		const kbId = selected?.id ?? null;
		if (kbId == null) return;
		busySourceId = source.id;
		actionError = null;
		try {
			await actions.removeSource(source.id);
			if (alive && model != null && selected?.id === kbId) {
				rows = rows.filter((candidate) => candidate.id !== source.id);
				confirmingRemoveId = null;
			}
			await actions.refreshKnowledgeBases();
		} catch (err) {
			if (alive && model != null && selected?.id === kbId) {
				confirmingRemoveId = null;
				actionError = actions.errorMessage(err, 'Could not remove the source.');
			}
		} finally {
			busySourceId = null;
		}
	}
</script>

{#if model}
	<div bind:this={root} class="flex min-h-0 flex-1 flex-col" data-guide-id={guideId}>
		<MasterDetailShell
			detailKey={creating ? 'new-knowledge-base' : (selected?.id ?? null)}
			detailLabel="Knowledge base details"
		>
			{#snippet railHeader()}
				<div class="flex items-center gap-1.5">
					<div class="min-w-0 flex-1">
						<SearchInput
							bind:value={search}
							placeholder="Search knowledge bases"
							ariaLabel="Search knowledge bases"
						/>
					</div>
				</div>
			{/snippet}
			{#snippet rail()}
				{#if knowledgeBases.length === 0}
					<p class="px-2 py-3 text-xs text-gray-500 dark:text-gray-400">
						No knowledge bases yet. New knowledge base starts one.
					</p>
				{:else if filtered.length === 0}
					<p class="px-2 py-3 text-xs text-gray-500 dark:text-gray-400">
						No knowledge bases match.
					</p>
				{:else}
					<div class="space-y-1">
						{#each filtered as kb (kb.id)}
							{@const pill = statusPill(kb)}
							<RailRowButton
								selected={!creating && selected?.id === kb.id}
								disabled={writeBusy}
								onclick={() => selectKb(kb.id)}
							>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
										{kb.name}
									</span>
									<span class="mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400">
										{kb.rollup.sourceCount}
										{kb.rollup.sourceCount === 1 ? 'source' : 'sources'}
									</span>
								</span>
								<span
									class={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${pill.cls}`}
								>
									<span class="sr-only">Status: </span>
									{pill.label}
								</span>
							</RailRowButton>
						{/each}
					</div>
				{/if}
			{/snippet}
			{#snippet detail()}
				{#if creating || selected}
					<div class="flex min-w-0 items-center justify-between gap-3">
						<h3 class="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
							{creating ? 'New knowledge base' : selected?.name}
						</h3>
					</div>

					{#if actionError}
						<p class="text-sm text-red-700 dark:text-red-300" role="alert">{actionError}</p>
					{/if}

					<CardContainer title="Knowledge base">
						<div slot="content" class="space-y-3">
							<div>
								<label for="kb-name" class="readonly-label">Name</label>
								<Input
									id="kb-name"
									bind:value={editName}
									maxlength={limits?.nameMaxChars ?? 0}
									aria-invalid={!nameValid && dirty}
									aria-describedby={!nameValid && dirty ? 'kb-name-error' : undefined}
									placeholder={model.sourcePolicy.namePlaceholder}
								/>
								{#if !nameValid && dirty}
									<p id="kb-name-error" class="mt-1 text-xs text-red-600 dark:text-red-400">
										Enter a knowledge-base name.
									</p>
								{/if}
							</div>
							<div>
								<label for="kb-description" class="readonly-label">Description</label>
								<Textarea
									id="kb-description"
									bind:value={editDescription}
									rows={2}
									maxlength={limits?.descriptionMaxChars ?? 0}
									aria-invalid={!descriptionValid}
									placeholder="What the bots should find here."
									class="resize-y text-sm"
								/>
							</div>
							{#if !creating && selected}
								<p class="text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
									{selected.rollup.sourceCount} of {limits?.maxSourcesPerBase ?? 0} sources ·
									{selected.rollup.charCount.toLocaleString('en-US')} of {(
										limits?.maxCharsPerBase ?? 0
									).toLocaleString('en-US')} characters
								</p>
							{/if}
							<div class="flex flex-wrap items-center gap-2">
								<Button
									size="sm"
									color="blue"
									disabled={!dirty || saving || deletingKb || !nameValid || !descriptionValid}
									onclick={saveKb}
								>
									{saving ? 'Saving…' : creating ? 'Create knowledge base' : 'Save changes'}
								</Button>
								<Button
									size="sm"
									color="alternative"
									disabled={saving || deletingKb || (!creating && !dirty)}
									onclick={discard}
								>
									Discard
								</Button>
							</div>
						</div>
					</CardContainer>

					{#if !creating && selected}
						<CardContainer title="Sources">
							<div slot="content" class="space-y-3">
								{#if rows.length === 0}
									<p class="text-sm text-gray-500 dark:text-gray-400">
										{model.sourcePolicy.emptySources}
									</p>
								{:else}
									<div class="divide-y divide-gray-100 dark:divide-gray-800">
										{#each rows as source (source.id)}
											{@const status = source.status}
											<div class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
												<span class="shrink-0 text-gray-400 dark:text-gray-500">
													{#if source.kind === 'upload'}
														<UploadOutline class="h-4 w-4" />
													{:else}
														<FileLinesOutline class="h-4 w-4" />
													{/if}
												</span>
												<span class="min-w-0 flex-1">
													<span
														class="block truncate text-sm font-medium text-gray-900 dark:text-gray-100"
													>
														{source.title}
													</span>
													<span class="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px]">
														<span class={toneClass(status.tone)}>{status.label}</span>
														{#if source.chunkCount > 0}
															<span class="text-gray-400 dark:text-gray-500">
																{source.chunkCount}
																{source.chunkCount === 1 ? 'chunk' : 'chunks'} ·
																{source.charCount.toLocaleString('en-US')} chars
															</span>
														{/if}
														{#each source.metadata as item}
															<span class={toneClass(item.tone ?? 'muted')}>{item.label}</span>
														{/each}
														{#if source.errorDetail}
															<span class="text-red-500 dark:text-red-400"
																>{source.errorDetail}</span
															>
														{/if}
														{#if source.lastGoodNotice}
															<span class="text-gray-500 dark:text-gray-400"
																>{source.lastGoodNotice}</span
															>
														{/if}
														{#if busySourceId === source.id}
															<span class="text-blue-600 dark:text-blue-400" role="status">
																{confirmingRemoveId === source.id ? 'Removing…' : 'Re-ingesting…'}
															</span>
														{/if}
													</span>
												</span>
												{#if confirmingRemoveId !== source.id}
													<span class="flex shrink-0 items-center gap-1">
														<Button
															size="xs"
															color="alternative"
															disabled={sourceWriteBusy || uploading || !source.canRefresh}
															onclick={() => reingest(source)}
															title={source.refreshTitle}
															aria-label={`Re-ingest ${source.title}`}
														>
															<RefreshOutline class="h-3.5 w-3.5" />
														</Button>
														<Button
															size="xs"
															color="alternative"
															disabled={sourceWriteBusy || uploading}
															onclick={() => (confirmingRemoveId = source.id)}
															title="Remove from this knowledge base"
															aria-label={`Remove ${source.title} from this knowledge base`}
														>
															<TrashBinOutline class="h-3.5 w-3.5" />
														</Button>
													</span>
												{/if}
											</div>
											{#if confirmingRemoveId === source.id}
												<!-- In-place removal confirm (no modals). -->
												<div
													class="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/80 dark:bg-red-950/40"
													role="alert"
												>
													<p class="min-w-0 text-sm text-red-800 dark:text-red-300">
														Remove "{source.title}"? Its ingested content leaves the knowledge base
														immediately.
													</p>
													<div class="flex shrink-0 items-center gap-2">
														<Button
															size="sm"
															color="red"
															disabled={sourceWriteBusy}
															onclick={() => confirmRemove(source)}
														>
															{busySourceId === source.id ? 'Removing…' : 'Remove source'}
														</Button>
														<Button
															size="sm"
															color="alternative"
															disabled={sourceWriteBusy}
															onclick={() => (confirmingRemoveId = null)}
														>
															Cancel
														</Button>
													</div>
												</div>
											{/if}
										{/each}
									</div>
								{/if}

								<div
									class="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800"
								>
									<Button
										size="xs"
										color="light"
										disabled={sourceCapReached || sourceWriteBusy || uploading}
										onclick={openResourcePicker}
									>
										<FileLinesOutline class="me-1.5 h-3.5 w-3.5" />
										{model.sourcePolicy.addLabel}
									</Button>
									<Button
										size="xs"
										color="light"
										disabled={sourceCapReached || sourceWriteBusy || uploading}
										onclick={toggleUploadPicker}
									>
										<UploadOutline class="me-1.5 h-3.5 w-3.5" />
										Upload file
									</Button>
									<span class="text-[11px] text-gray-400 dark:text-gray-500">
										{model.sourcePolicy.availability}
									</span>
								</div>
								{#if sourceCapReached}
									<p class="text-xs text-amber-700 dark:text-amber-400">
										This knowledge base has reached its {limits?.maxSourcesPerBase ?? 0}-source
										limit. Remove a source before adding another.
									</p>
								{/if}

								{#if addMode === 'resource'}
									<div class="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
										<p class="text-xs text-gray-600 dark:text-gray-300">
											{model.sourcePolicy.disclosure}
										</p>
										<SearchInput
											bind:value={resourceSearch}
											placeholder={model.sourcePolicy.searchLabel}
											ariaLabel={model.sourcePolicy.searchLabel}
											oninput={scheduleResourceSearch}
											onclear={() => void searchResources()}
										/>
										{#if resourceLoading}
											<p class="text-xs text-gray-500 dark:text-gray-400">Loading…</p>
										{:else if resourceResults.length === 0}
											<p class="text-xs text-gray-500 dark:text-gray-400">
												{model.sourcePolicy.emptySearch}
											</p>
										{:else}
											<div class="divide-y divide-gray-100 dark:divide-gray-800">
												{#each resourceResults as row (row.id)}
													<div class="flex items-center gap-3 py-1.5">
														<span class="min-w-0 flex-1">
															<span class="block truncate text-sm text-gray-900 dark:text-gray-100">
																{row.title}
															</span>
															<span
																class="block truncate text-[11px] text-gray-400 dark:text-gray-500"
															>
																{row.metadata}
															</span>
														</span>
														<Button
															size="xs"
															color="blue"
															outline
															disabled={sourceWriteBusy || uploading || sourceCapReached}
															onclick={() => addResource(row)}
														>
															{addingResource ? 'Adding…' : 'Add'}
														</Button>
													</div>
												{/each}
											</div>
										{/if}
									</div>
								{:else if addMode === 'upload'}
									<div class="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
										<label for="kb-upload" class="readonly-label"
											>{model.sourcePolicy.uploadLabel}</label
										>
										<input
											id="kb-upload"
											type="file"
											accept={model.sourcePolicy.uploadAccept}
											bind:files={uploadFiles}
											disabled={uploading || sourceWriteBusy}
											class="block w-full text-sm text-gray-700 file:me-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 max-[1024px]:text-base dark:text-gray-300 dark:file:bg-gray-800 dark:file:text-gray-200"
										/>
										<div class="flex flex-wrap items-center gap-2">
											<Button
												size="sm"
												color="blue"
												disabled={!uploadFiles?.[0] ||
													uploading ||
													sourceWriteBusy ||
													sourceCapReached}
												onclick={uploadFile}
											>
												{uploading ? 'Ingesting…' : 'Upload and ingest'}
											</Button>
											<Button
												size="sm"
												color="alternative"
												disabled={uploading}
												onclick={cancelUpload}
											>
												Cancel
											</Button>
										</div>
									</div>
								{/if}
							</div>
						</CardContainer>

						{#if usage}
							<CardContainer title="Used by">
								<div slot="content" class="space-y-2">
									{#if usage.entries.length === 0}
										<p class="text-sm text-gray-500 dark:text-gray-400">{usage.emptyMessage}</p>
										{#if usage.connect}
											{@const intent = usage.connect}
											<Button
												size="xs"
												color="alternative"
												href={intent.href}
												onclick={(event: MouseEvent) => openUsage(event, intent)}
												>{intent.label}</Button
											>
										{/if}
									{:else}
										<p class="text-xs text-amber-700 dark:text-amber-400">{usage.blockedMessage}</p>
										<div class="space-y-1">
											{#each usage.entries as intent (intent.id)}
												<a
													href={intent.href}
													onclick={(event) => openUsage(event, intent)}
													class="flex min-h-11 items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2 hover:border-gray-200 hover:bg-gray-50 min-[1025px]:min-h-0 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-950"
												>
													<span
														class="min-w-0 truncate text-sm font-medium text-gray-900 dark:text-gray-100"
														>{intent.label}</span
													>
													{#if intent.detail}<span
															class="shrink-0 text-xs text-gray-500 dark:text-gray-400"
															>{intent.detail}</span
														>{/if}
												</a>
											{/each}
										</div>
									{/if}
								</div>
							</CardContainer>
						{/if}

						{#if history}
							<CardContainer title="History">
								<div slot="content">
									{@render history()}
								</div>
							</CardContainer>
						{/if}

						{#if confirmingDeleteKb}
							<!-- In-place destructive confirm (no modals). -->
							<div
								class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/80 dark:bg-red-950/40"
								role="alert"
							>
								<p class="min-w-0 text-sm text-red-800 dark:text-red-300">
									Delete "{selected.name}"? Its {selected.rollup.sourceCount}
									{selected.rollup.sourceCount === 1 ? 'source' : 'sources'} and all ingested content
									are removed immediately.
								</p>
								<div class="flex shrink-0 items-center gap-2">
									<Button size="sm" color="red" disabled={deletingKb} onclick={confirmDeleteKb}>
										<TrashBinOutline class="me-1.5 h-3.5 w-3.5" />
										{deletingKb ? 'Deleting…' : 'Delete knowledge base'}
									</Button>
									<Button
										size="sm"
										color="alternative"
										disabled={deletingKb}
										onclick={() => (confirmingDeleteKb = false)}
									>
										Cancel
									</Button>
								</div>
							</div>
						{:else}
							<div class="flex justify-end">
								<Button
									size="sm"
									color="red"
									outline
									disabled={saving ||
										deletingKb ||
										sourceWriteBusy ||
										uploading ||
										navigationDirty ||
										(usage?.entries.length ?? 0) > 0}
									title={(usage?.entries.length ?? 0) > 0
										? usage?.deleteBlockedReason
										: 'Delete this knowledge base'}
									onclick={() => (confirmingDeleteKb = true)}
								>
									<TrashBinOutline class="me-1.5 h-3.5 w-3.5" />
									Delete knowledge base
								</Button>
							</div>
						{/if}
					{/if}
				{:else}
					<p class="text-sm text-gray-500 dark:text-gray-400">
						{knowledgeBases.length === 0
							? model.sourcePolicy.emptyDetail
							: 'Select a knowledge base.'}
					</p>
				{/if}
			{/snippet}
		</MasterDetailShell>
	</div>
{/if}
