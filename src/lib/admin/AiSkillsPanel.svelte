<!-- Skills interaction only. Hosts own routes, mutations, authority, history and rendering. -->
<script lang="ts" generics="KnowledgeId extends string | number = number">
	import { Button, Input, Select, Textarea, Toggle } from 'flowbite-svelte';
	import CardContainer from '../primitives/CardContainer.svelte';
	import MasterDetailShell from '../primitives/MasterDetailShell.svelte';
	import RailRowButton from '../primitives/RailRowButton.svelte';
	import SearchInput from '../primitives/SearchInput.svelte';
	import type { AiSkillDefinition, AiSkillsPanelProps } from './skills-types';

	let {
		model,
		actions,
		settingsDirty = $bindable(false),
		editorBusy = $bindable(false),
		history,
		guideId
	}: AiSkillsPanelProps<KnowledgeId> = $props();

	let root = $state<HTMLDivElement>();
	const skillCatalog = $derived(model?.skillCatalog ?? []);
	const botCatalog = $derived(model?.botCatalog ?? []);
	let grants = $derived(model?.grants.slice() ?? []);
	const selectedSkillId = $derived(model?.selectedSkillId ?? null);
	const settings = $derived(model?.settings ?? {});
	const bindings = $derived(model?.bindings ?? {});
	const kbOptions = $derived(model?.kbOptions ?? []);
	const bridgeTools = $derived(model?.bridgeTools ?? []);

	let search = $state('');
	let grantError = $state<string | null>(null);
	let pending = $state<string[]>([]);
	let cascadeConfirm = $state<{ botId: string; message: string } | null>(null);

	let tuningSettings = $derived(settings);
	let tuningBindings = $derived(bindings);

	const filtered = $derived(
		search.trim()
			? skillCatalog.filter((skill) => {
					const needle = search.trim().toLowerCase();
					return (
						skill.name.toLowerCase().includes(needle) ||
						skill.tagline.toLowerCase().includes(needle)
					);
				})
			: skillCatalog
	);
	const selected = $derived(skillCatalog.find((skill) => skill.id === selectedSkillId) ?? null);

	const toolStatus = $derived(new Map(bridgeTools.map((tool) => [tool.id, tool])));
	const liveToolIds = $derived(
		new Set(bridgeTools.filter((tool) => tool.status === 'live').map((tool) => tool.id))
	);

	let paramDraft = $state<Record<string, string>>({});
	let editRevision = $state(1);
	let savingParams = $state(false);
	let paramsError = $state<string | null>(null);
	let paramsStale = $state(false);
	let reloadingParams = $state(false);
	let previewTuned = $state(false);
	let bindingPending = $state<string | null>(null);
	let bindingError = $state<string | null>(null);
	const writeBusy = $derived(
		pending.length > 0 || savingParams || reloadingParams || bindingPending != null
	);

	let seededSkillId: string | null | undefined;
	$effect(() => {
		const skill = selected;
		if (seededSkillId === (skill?.id ?? null)) return;
		seededSkillId = skill?.id ?? null;
		grantError = null;
		paramsError = null;
		bindingError = null;
		paramsStale = false;
		cascadeConfirm = null;
		previewTuned = false;
		seedParams(skill?.id ?? null);
	});

	function seedParams(skillId: string | null) {
		if (!skillId) {
			paramDraft = {};
			editRevision = 1;
			return;
		}
		const row = tuningSettings[skillId];
		const draft: Record<string, string> = {};
		for (const param of selected?.parameters ?? []) {
			draft[param.key] = row?.params[param.key] ?? '';
		}
		paramDraft = draft;
		// Capture the revision with the working copy, never from a later live map.
		editRevision = row?.revision ?? 1;
	}

	const paramsDirty = $derived.by(() => {
		if (!selected?.parameters?.length) return false;
		const saved = tuningSettings[selected.id]?.params ?? {};
		return selected.parameters.some(
			(param) => (paramDraft[param.key] ?? '') !== (saved[param.key] ?? '')
		);
	});
	const paramsInvalid = $derived.by(() =>
		(selected?.parameters ?? []).some((param) => {
			const value = paramDraft[param.key] ?? '';
			return value.length > param.maxChars || value.includes('{{param:');
		})
	);
	$effect(() => {
		settingsDirty = paramsDirty;
		editorBusy = writeBusy;
	});
	function grantedCount(skillId: string): number {
		return grants.filter((grant) => grant.skillId === skillId).length;
	}

	function isGranted(skillId: string, botId: string): boolean {
		return grants.some((grant) => grant.skillId === skillId && grant.botId === botId);
	}

	function needsSetup(skill: AiSkillDefinition): boolean {
		if (grantedCount(skill.id) === 0) return false;
		const params = tuningSettings[skill.id]?.params ?? {};
		const bound = tuningBindings[skill.id] ?? {};
		const missingParam = (skill.parameters ?? []).some(
			(param) => param.required && !(params[param.key] ?? '').trim()
		);
		const missingSlot = (skill.knowledgeSlots ?? []).some(
			(slot) => slot.required && bound[slot.id] == null
		);
		return missingParam || missingSlot;
	}

	function facetSummary(skill: AiSkillDefinition): string {
		const parts: string[] = [];
		if (skill.parameters?.length) {
			parts.push(
				`${skill.parameters.length} ${skill.parameters.length === 1 ? 'parameter' : 'parameters'}`
			);
		}
		if (skill.knowledgeSlots?.length) {
			parts.push(
				`${skill.knowledgeSlots.length} knowledge ${skill.knowledgeSlots.length === 1 ? 'slot' : 'slots'}`
			);
		}
		if (skill.tools?.length) parts.push(skill.tools.map((tool) => tool.tool).join(' · '));
		if (skill.requires?.length) {
			parts.push(
				`requires ${skill.requires
					.map((id) => skillCatalog.find((s) => s.id === id)?.name ?? id)
					.join(' · ')}`
			);
		}
		return parts.join(' · ');
	}

	async function navigateToSkill(skillId: string) {
		if (writeBusy) return;
		await actions.navigate(skillId);
		grantError = null;
	}

	function selectSkill(skillId: string) {
		if (writeBusy) return;
		if (selected?.id === skillId) return;
		if (paramsDirty) {
			actions.requestDiscard({
				message: 'Discard the unsaved skill settings and open another skill?',
				confirmLabel: 'Discard and open skill',
				continue: () => navigateToSkill(skillId),
				focusAfter: () => root?.querySelector<HTMLElement>('[aria-label="Skill details"]') ?? null
			});
			return;
		}
		void navigateToSkill(skillId).catch(() => undefined);
	}

	async function toggleGrant(botId: string, cascade = false) {
		if (!selected || pending.length > 0) return;
		const skillId = selected.id;
		const next = !isGranted(skillId, botId);
		grantError = null;
		cascadeConfirm = null;
		pending = [...pending, botId];
		const before = grants;
		try {
			const result = await actions.setGrant({ botId, skillId, allowed: next, cascade });
			grants = result.grants;
			actions.grantsChanged(result.grants);
		} catch (err) {
			grants = before;
			actions.grantsChanged(before);
			if (selected?.id !== skillId) return;
			if (!next && actions.classifyError(err) === 'dependents') {
				cascadeConfirm = {
					botId,
					message: actions.errorMessage(err, 'Other granted skills require this one.')
				};
			} else {
				grantError = actions.errorMessage(err, 'Could not save the grant.');
			}
		} finally {
			pending = pending.filter((id) => id !== botId);
		}
	}

	async function saveParams() {
		if (!selected || savingParams || paramsInvalid || paramsStale) return;
		const skillId = selected.id;
		savingParams = true;
		paramsError = null;
		try {
			const saved = await actions.saveSettings({
				skillId,
				params: { ...paramDraft },
				expectedRevision: editRevision
			});
			tuningSettings = {
				...tuningSettings,
				[skillId]: { params: saved.params, revision: saved.revision }
			};
			if (selected?.id === skillId) editRevision = saved.revision;
		} catch (err) {
			if (selected?.id !== skillId) return;
			if (actions.classifyError(err) === 'stale') {
				paramsStale = true;
			} else {
				paramsError = actions.errorMessage(err, 'Could not save the settings.');
			}
		} finally {
			savingParams = false;
		}
	}

	async function reloadParams() {
		if (!selected || reloadingParams) return;
		const skillId = selected.id;
		reloadingParams = true;
		paramsError = null;
		try {
			const fresh = await actions.loadSettings(skillId);
			tuningSettings = {
				...tuningSettings,
				[skillId]: { params: fresh.params, revision: fresh.revision }
			};
			if (selected?.id === skillId) {
				paramsStale = false;
				seedParams(skillId);
			}
		} catch (err) {
			if (selected?.id === skillId) {
				paramsError = actions.errorMessage(err, 'Could not reload the settings.');
			}
		} finally {
			reloadingParams = false;
		}
	}

	function discardParams() {
		seedParams(selected?.id ?? null);
		paramsError = null;
		paramsStale = false;
	}

	async function bindSlot(slotId: string, raw: string) {
		if (!selected || bindingPending) return;
		const skillId = selected.id;
		const kbId = raw === '' ? null : kbOptions.find((kb) => String(kb.id) === raw)?.id;
		if (kbId === undefined) return;
		bindingPending = slotId;
		bindingError = null;
		const beforeBindings = tuningBindings;
		const skillRow = { ...(tuningBindings[skillId] ?? {}) };
		if (kbId == null) delete skillRow[slotId];
		else skillRow[slotId] = kbId;
		tuningBindings = { ...tuningBindings, [skillId]: skillRow };
		try {
			await actions.setKnowledgeBinding({ skillId, slotId, knowledgeId: kbId });
		} catch (err) {
			tuningBindings = beforeBindings;
			if (selected?.id === skillId) {
				bindingError = actions.errorMessage(err, 'Could not save the knowledge binding.');
			}
		} finally {
			bindingPending = null;
		}
	}

	const selectedTuning = $derived.by(() => {
		if (!selected) return { params: {}, knowledge: {} };
		const knowledge: Record<string, string> = {};
		for (const [slotId, kbId] of Object.entries(tuningBindings[selected.id] ?? {})) {
			const name = kbOptions.find((kb) => kb.id === kbId)?.name;
			if (name) knowledge[slotId] = name;
		}
		return { params: { ...paramDraft }, knowledge };
	});

	const tunedPreview = $derived(
		selected ? actions.renderPreview(selected, selectedTuning, liveToolIds) : ''
	);

	const dormantTools = $derived(
		(selected?.tools ?? []).filter((tool) => toolStatus.get(tool.tool)?.status !== 'live')
	);
</script>

{#if model}
	<div bind:this={root} class="flex min-h-0 flex-1 flex-col" data-guide-id={guideId}>
		<MasterDetailShell detailKey={selected?.id ?? null} detailLabel="Skill details">
			{#snippet railHeader()}
				<div class="flex items-center gap-1.5">
					<div class="min-w-0 flex-1">
						<SearchInput
							bind:value={search}
							placeholder="Search skills"
							ariaLabel="Search skills"
						/>
					</div>
				</div>
			{/snippet}
			{#snippet rail()}
				{#if filtered.length === 0}
					<p class="px-2 py-3 text-xs text-gray-500 dark:text-gray-400">No skills match.</p>
				{:else}
					<div class="space-y-1">
						{#each filtered as skill (skill.id)}
							{@const count = grantedCount(skill.id)}
							{@const attention = needsSetup(skill)}
							<RailRowButton
								selected={selected?.id === skill.id}
								disabled={writeBusy}
								onclick={() => selectSkill(skill.id)}
							>
								<span class="min-w-0 flex-1">
									<span class="flex items-center gap-1.5">
										<span
											class="block truncate text-sm font-medium text-gray-900 dark:text-gray-100"
										>
											{skill.name}
										</span>
										{#if attention}
											<span
												class="h-2 w-2 shrink-0 rounded-full bg-amber-400"
												title="Granted but not fully set up"
											>
												<span class="sr-only">Granted but not fully set up</span>
											</span>
										{/if}
									</span>
									<span class="mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400">
										{skill.tagline}
									</span>
								</span>
								{#if count > 0}
									<span
										class="shrink-0 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
										title={`Granted to ${count} ${count === 1 ? 'bot' : 'bots'}`}
									>
										<span aria-hidden="true">{count}</span>
										<span class="sr-only">Granted to {count} {count === 1 ? 'bot' : 'bots'}</span>
									</span>
								{/if}
							</RailRowButton>
						{/each}
					</div>
				{/if}
			{/snippet}
			{#snippet detail()}
				{#if selected}
					<div class="min-w-0">
						<div class="flex flex-wrap items-center gap-2">
							<h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
								{selected.name}
							</h3>
							<span
								class="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] capitalize text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400"
							>
								{selected.category}
							</span>
							<span class="text-[11px] text-gray-400 dark:text-gray-500">{selected.version}</span>
						</div>
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{selected.tagline}</p>
						{#if facetSummary(selected)}
							<p class="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
								{facetSummary(selected)}
							</p>
						{/if}
					</div>

					{#if grantError}
						<p class="text-sm text-red-700 dark:text-red-300" role="alert">{grantError}</p>
					{/if}

					<CardContainer title="Granted to">
						<div slot="content" class="space-y-2">
							<p class="text-xs text-gray-500 dark:text-gray-400">
								Granting adds this skill to the bot's composed context immediately{selected.requires
									?.length
									? ' · required skills are granted with it'
									: ''}.
							</p>
							<div class="space-y-1">
								{#each botCatalog as bot (bot.id)}
									{@const granted = isGranted(selected.id, bot.id)}
									<div
										class="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2 dark:border-gray-800"
									>
										<span class="flex min-w-0 items-center gap-2">
											<span
												class={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white ${bot.color}`}
											>
												{bot.initials}
											</span>
											<span class="min-w-0">
												<span
													class="block truncate text-sm font-medium text-gray-900 dark:text-gray-100"
												>
													{bot.name}
												</span>
												<span class="block truncate text-[11px] text-gray-500 dark:text-gray-400">
													{bot.role}
												</span>
											</span>
										</span>
										<span class="skill-toggle-target flex shrink-0 items-center gap-2">
											{#if pending.includes(bot.id)}
												<span class="text-xs text-gray-500 dark:text-gray-400" role="status">
													Saving…
												</span>
											{/if}
											{#key `${selected.id}:${bot.id}:${granted}:${pending.includes(bot.id)}`}
												<Toggle
													checked={granted}
													disabled={pending.length > 0}
													aria-label={`${granted ? 'Revoke' : 'Grant'} ${selected.name} ${granted ? 'from' : 'to'} ${bot.name}`}
													on:change={() => toggleGrant(bot.id)}
												/>
											{/key}
										</span>
									</div>
									{#if cascadeConfirm?.botId === bot.id}
										<div
											class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/80 dark:bg-amber-950/40"
											role="alert"
										>
											<p class="min-w-0 text-sm text-amber-800 dark:text-amber-300">
												{cascadeConfirm.message} Turning it off revokes those too.
											</p>
											<div class="flex shrink-0 items-center gap-2">
												<Button
													size="sm"
													color="alternative"
													disabled={pending.length > 0}
													onclick={() => toggleGrant(bot.id, true)}
												>
													Turn off together
												</Button>
												<Button
													size="sm"
													color="alternative"
													onclick={() => (cascadeConfirm = null)}
												>
													Cancel
												</Button>
											</div>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</CardContainer>

					{#if selected.parameters?.length}
						<CardContainer title="Parameters">
							<div slot="content" class="space-y-3">
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Shared by every bot this skill is granted to · values are woven into the
									instructions.
								</p>
								{#if paramsError}
									<p class="text-sm text-red-700 dark:text-red-300" role="alert">{paramsError}</p>
								{/if}
								{#if paramsStale}
									<div
										class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/80 dark:bg-amber-950/40"
										role="alert"
									>
										<p class="min-w-0 text-sm text-amber-800 dark:text-amber-300">
											These settings were changed by someone else since you loaded them. Reload
											picks up their version · your unsaved edits here are discarded.
										</p>
										<Button
											size="sm"
											color="alternative"
											disabled={reloadingParams}
											onclick={reloadParams}
										>
											{reloadingParams ? 'Reloading…' : 'Reload settings'}
										</Button>
									</div>
								{/if}
								{#each selected.parameters as param (param.key)}
									{@const chars = (paramDraft[param.key] ?? '').length}
									{@const containsReservedPlaceholder = (paramDraft[param.key] ?? '').includes(
										'{{param:'
									)}
									<div>
										<div class="flex items-baseline justify-between">
											<label for={`param-${param.key}`} class="readonly-label">
												{param.label}{param.required ? '' : ' · optional'}
											</label>
											<span
												class={`text-[11px] tabular-nums ${chars > param.maxChars ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}
											>
												{chars.toLocaleString('en-US')} of {param.maxChars.toLocaleString('en-US')}
											</span>
										</div>
										{#if param.kind === 'multiline'}
											<Textarea
												id={`param-${param.key}`}
												bind:value={
													() => paramDraft[param.key] ?? '',
													(value) => (paramDraft[param.key] = value)
												}
												rows={3}
												maxlength={param.maxChars}
												aria-invalid={chars > param.maxChars || containsReservedPlaceholder}
												placeholder={param.placeholder ?? ''}
												class="resize-y text-sm"
											/>
										{:else}
											<Input
												id={`param-${param.key}`}
												bind:value={paramDraft[param.key]}
												maxlength={param.maxChars}
												aria-invalid={chars > param.maxChars || containsReservedPlaceholder}
												placeholder={param.placeholder ?? ''}
											/>
										{/if}
										<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{param.description}</p>
										{#if containsReservedPlaceholder}
											<p class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
												Remove the reserved <code>{'{{param:'}</code> placeholder syntax.
											</p>
										{/if}
									</div>
								{/each}
								<div class="flex items-center gap-2">
									<Button
										size="sm"
										color="blue"
										disabled={!paramsDirty || savingParams || paramsInvalid || paramsStale}
										onclick={saveParams}
									>
										{savingParams ? 'Saving…' : 'Save settings'}
									</Button>
									<Button
										size="sm"
										color="alternative"
										disabled={!paramsDirty || savingParams}
										onclick={discardParams}
									>
										Discard
									</Button>
								</div>
							</div>
						</CardContainer>
					{/if}

					{#if selected.knowledgeSlots?.length}
						<CardContainer title="Knowledge">
							<div slot="content" class="space-y-3">
								{#if bindingError}
									<p class="text-sm text-red-700 dark:text-red-300" role="alert">{bindingError}</p>
								{/if}
								{#if dormantTools.length > 0}
									<p class="text-xs text-amber-600 dark:text-amber-400">
										Connections save now · bots search only when their tools are available.
									</p>
								{/if}
								{#each selected.knowledgeSlots as slot (slot.id)}
									{@const boundId = (tuningBindings[selected.id] ?? {})[slot.id]}
									{@const dangling = boundId != null && !kbOptions.some((kb) => kb.id === boundId)}
									<div>
										<div class="flex items-baseline justify-between">
											<label for={`slot-${slot.id}`} class="readonly-label">
												{slot.label}{slot.required ? '' : ' · optional'}
											</label>
											{#if slot.required && boundId == null}
												<span class="text-[11px] font-medium text-amber-600 dark:text-amber-400">
													Not connected
												</span>
											{/if}
										</div>
										<Select
											id={`slot-${slot.id}`}
											value={boundId != null ? String(boundId) : ''}
											disabled={bindingPending != null}
											placeholder=""
											aria-label={`${slot.label} knowledge base`}
											on:change={(event) =>
												bindSlot(slot.id, (event.currentTarget as HTMLSelectElement).value)}
										>
											<option value="">Not connected</option>
											{#each kbOptions as kb (kb.id)}
												<option value={String(kb.id)}>{kb.name}</option>
											{/each}
										</Select>
										{#if dangling}
											<p class="mt-1 text-xs text-amber-600 dark:text-amber-400">
												The bound knowledge base no longer exists · reconnect one.
											</p>
										{:else}
											<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
												{slot.description}
											</p>
										{/if}
									</div>
								{/each}
								{#if bindingPending}
									<p class="text-xs text-gray-500 dark:text-gray-400" role="status">
										Saving connection…
									</p>
								{/if}
								{#if kbOptions.length === 0}
									<p class="text-xs text-gray-500 dark:text-gray-400">
										Add a knowledge base before connecting it.
									</p>
								{/if}
							</div>
						</CardContainer>
					{/if}

					{#if selected.tools?.length}
						<CardContainer title="Tools">
							<div slot="content" class="space-y-1">
								{#each selected.tools as tool (tool.tool)}
									{@const def = toolStatus.get(tool.tool)}
									<div
										class="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2 dark:border-gray-800"
									>
										<span class="min-w-0">
											<span
												class="block truncate font-mono text-sm text-gray-900 dark:text-gray-100"
											>
												{tool.tool}
											</span>
											<span class="block truncate text-[11px] text-gray-500 dark:text-gray-400">
												{tool.purpose}
											</span>
										</span>
										{#if def?.status === 'live'}
											<span
												class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
											>
												Live
											</span>
										{:else}
											<span
												class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
											>
												{def?.statusLabel ?? 'Not available'}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						</CardContainer>
					{/if}

					{#if selected.requires?.length}
						<CardContainer title="Requires">
							<div slot="content" class="flex flex-wrap gap-2">
								{#each selected.requires as depId (depId)}
									<Button size="xs" color="light" onclick={() => selectSkill(depId)}>
										{skillCatalog.find((skill) => skill.id === depId)?.name ?? depId}
									</Button>
								{/each}
							</div>
						</CardContainer>
					{/if}

					<CardContainer title="Instruction pack">
						<div slot="content" class="space-y-2">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Product-authored. This text joins the composed context of every bot it is granted
									to.
								</p>
								{#if selected.parameters?.length}
									<Button size="xs" color="light" onclick={() => (previewTuned = !previewTuned)}>
										{previewTuned ? 'Show template' : 'Preview with your settings'}
									</Button>
								{/if}
							</div>
							<pre
								class="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">{previewTuned
									? tunedPreview
									: selected.instructionPack}</pre>
						</div>
					</CardContainer>

					{#if history}
						<CardContainer title="History">
							<div slot="content">
								{@render history()}
							</div>
						</CardContainer>
					{/if}
				{:else}
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Select a skill to review and grant it.
					</p>
				{/if}
			{/snippet}
		</MasterDetailShell>
	</div>
{/if}

<style>
	@media (max-width: 1024px) {
		.skill-toggle-target :global(label) {
			display: inline-flex;
			min-height: 44px;
			min-width: 44px;
			align-items: center;
			justify-content: center;
		}
	}
</style>
