<!--
	ManualObservationCommandSurface: the drawer that records a manual case's
	observation. A manual case is one a person checks by hand; its result is
	what they observed, entered here. The report offers "Record manual
	observation" on a case the host lets the reader complete
	(`ValidationCaseView.canComplete`); the host opens this drawer for it.

	The drawer rises out of the command bar (CommandDrawer) beside the sign
	drawer and holds what the person observed and the result they choose,
	Pass or Fail, with no result chosen until they choose one. Cancel and Save
	observation take the bar's center zone (PageCommandBarPair); Cancel turns
	red while typed input would be lost. Nothing is modal.

	The drawer records nothing itself: Save observation hands the case, the
	execution's revision the reader saw (`expectedRevision`, for the host to
	check that nothing changed meanwhile), the observation and the result to
	`oncomplete`. While a promise it returns runs, the drawer holds still and
	Save cannot run twice; a rejected one shows its refusal inside the drawer,
	which stays open, and returns focus to the observation (the fields are
	disabled while the save runs, which drops focus). The host closes it once
	the observation is recorded. A host that tracks the write itself passes
	`busy` and `error` instead.

	Escape and Cancel close it, never while a write is in flight. The
	observation and the result are cleared on every close and when the host
	opens it for another case, so nothing typed for one case is saved for
	another. A save holds its case: opened for another case while it runs,
	the drawer stays on the case being saved until the save ends. A saved one
	then moves to the case the host opened; a refused one stays with its case,
	what was typed and its refusal until it is saved, closed or the host
	opens another case.
-->
<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { Select, Textarea } from 'flowbite-svelte';
	import CommandDrawer from '../primitives/CommandDrawer.svelte';
	import PageCommandBarPair from '../primitives/PageCommandBarPair.svelte';
	import type { ManualObservationInput } from './types.js';

	let {
		open,
		caseId,
		title,
		expectedRevision,
		busy = false,
		error = null,
		oncomplete,
		oncancel
	}: {
		open: boolean;
		/** The case's identifier. */
		caseId: string;
		/** The case's title. */
		title: string;
		/** The execution's revision the reader saw. */
		expectedRevision: string;
		/** A write the host tracks itself is in flight. */
		busy?: boolean;
		/** The host's refusal, shown inside the drawer. */
		error?: string | null;
		/** Records the observation; a rejected promise shows the drawer's own refusal. */
		oncomplete: (input: ManualObservationInput) => Promise<void> | void;
		/** Closes the drawer. */
		oncancel: () => void;
	} = $props();

	const RESULTS = [
		{ value: 'pass', name: 'Pass' },
		{ value: 'fail', name: 'Fail' }
	];
	const NOT_SAVED =
		'The observation was not saved. Reload the page and check your access, then try again.';

	const componentId = $props.id();
	const titleId = `${componentId}-title`;
	const messageId = `${componentId}-message`;
	const errorId = `${componentId}-error`;
	const observedId = `${componentId}-observed`;
	const resultId = `${componentId}-result`;

	let observed = $state('');
	let result = $state<'' | 'pass' | 'fail'>('');
	let pending = $state(false);
	let failed = $state<string | null>(null);
	/** The case a save is for, shown until that save ends (and, refused, after). */
	let held = $state<{ caseId: string; title: string } | null>(null);
	let wasOpen = false;
	let wasWorking = false;
	let lastCase: string | null = null;
	/** Raised by every clear, so a save that ends after it shows no refusal. */
	let clears = 0;

	const working = $derived(busy || pending);
	const shown = $derived(held ?? { caseId, title });
	const text = $derived(observed.trim());
	const canSave = $derived(text.length > 0 && (result === 'pass' || result === 'fail'));
	const refusal = $derived(error ?? failed);

	function clear() {
		observed = '';
		result = '';
		failed = null;
		held = null;
		clears++;
	}

	// Nothing typed lingers after the decision, or follows the drawer to
	// another case. While its save runs the drawer stays on that save's case.
	$effect(() => {
		const nowOpen = open;
		const nowCase = caseId;
		const nowWorking = working;
		untrack(() => {
			if (!nowOpen && wasOpen) clear();
			else if (nowOpen && lastCase !== null && nowCase !== lastCase && !(nowWorking && held)) clear();
			wasOpen = nowOpen;
			lastCase = nowCase;
		});
	});

	// When a save ends: refused, focus returns to the observation (the fields
	// were disabled while it ran, which drops focus), so a retry is one
	// keystroke away and the case keeps what was typed; saved, the drawer
	// moves to the case the host opened meanwhile, if it did.
	$effect(() => {
		const nowWorking = working;
		untrack(() => {
			if (wasWorking && !nowWorking) {
				if (refusal !== null) {
					if (open) void tick().then(() => document.getElementById(observedId)?.focus());
				} else if (held) {
					if (held.caseId !== caseId) {
						observed = '';
						result = '';
					}
					held = null;
				}
			}
			wasWorking = nowWorking;
		});
	});

	function close() {
		if (!working) oncancel();
	}

	async function submit() {
		if (working || !canSave || (result !== 'pass' && result !== 'fail')) return;
		const forCase = shown;
		const clearsAt = clears;
		held = forCase;
		pending = true;
		failed = null;
		try {
			await oncomplete({ caseId: forCase.caseId, expectedRevision, observed: text, result });
		} catch {
			if (clears === clearsAt) failed = NOT_SAVED;
		} finally {
			pending = false;
		}
	}
</script>

<CommandDrawer
	{open}
	busy={working}
	labelledBy={titleId}
	describedBy={messageId}
	autoFocusSelector="textarea[name='manual-observation']"
	maxHeight="32rem"
	data-manual-observation-drawer
	onclose={close}
>
	<div class="mx-auto w-full max-w-3xl">
		<h3 id={titleId} class="page-command-drawer-title">Record manual observation: {shown.title}</h3>
		<p id={messageId} class="page-command-drawer-message" data-manual-statement>
			Record what you observed in {shown.caseId}. Your name and the time are saved with the result.
		</p>
		{#if refusal}
			<p id={errorId} class="page-command-drawer-error" role="alert">{refusal}</p>
		{/if}
		<div class="mt-3 grid grid-cols-1 gap-3 text-left" data-manual-form>
			<div class="min-w-0">
				<label for={observedId} class="form-label block text-xs">
					Observation <span class="text-red-500" aria-hidden="true">*</span>
				</label>
				<Textarea
					id={observedId}
					name="manual-observation"
					rows={4}
					maxlength={100000}
					bind:value={observed}
					disabled={working}
					class="form-input"
					aria-required="true"
					aria-describedby={refusal ? errorId : undefined}
				/>
			</div>
			<div class="min-w-0 sm:max-w-xs">
				<label for={resultId} class="form-label block text-xs">
					Result <span class="text-red-500" aria-hidden="true">*</span>
				</label>
				<Select
					id={resultId}
					name="manual-result"
					items={RESULTS}
					placeholder="Select a result"
					bind:value={result}
					disabled={working}
					class="form-input"
					aria-required="true"
				/>
			</div>
		</div>
	</div>
</CommandDrawer>

{#if open}
	<PageCommandBarPair
		label="Save observation"
		busyLabel="Saving…"
		busy={working}
		disabled={!canSave}
		discards={text.length > 0 || result !== ''}
		describedBy={messageId}
		onact={() => void submit()}
		oncancel={close}
	/>
{/if}
