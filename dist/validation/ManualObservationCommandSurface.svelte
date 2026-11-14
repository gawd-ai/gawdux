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
	which stays open. The host closes it once the observation is recorded.
	A host that tracks the write itself passes `busy` and `error` instead.

	Escape and Cancel close it, never while a write is in flight. The
	observation and the result are cleared on every close and when the host
	opens it for another case, so nothing typed for one case is saved for
	another.
-->
<script lang="ts">
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
	let wasOpen = false;
	let lastCase: string | null = null;

	const working = $derived(busy || pending);
	const text = $derived(observed.trim());
	const canSave = $derived(text.length > 0 && (result === 'pass' || result === 'fail'));
	const refusal = $derived(error ?? failed);

	// Nothing typed lingers after the decision, or follows the drawer to
	// another case.
	$effect(() => {
		const nowOpen = open;
		const nowCase = caseId;
		if ((!nowOpen && wasOpen) || (nowOpen && lastCase !== null && nowCase !== lastCase)) {
			observed = '';
			result = '';
			failed = null;
		}
		wasOpen = nowOpen;
		lastCase = nowCase;
	});

	function close() {
		if (!working) oncancel();
	}

	async function submit() {
		if (working || !canSave || (result !== 'pass' && result !== 'fail')) return;
		pending = true;
		failed = null;
		try {
			await oncomplete({ caseId, expectedRevision, observed: text, result });
		} catch {
			failed = NOT_SAVED;
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
		<h3 id={titleId} class="page-command-drawer-title">Record manual observation: {title}</h3>
		<p id={messageId} class="page-command-drawer-message" data-manual-statement>
			Record what you observed in {caseId}. Your name and the time are saved with the result.
		</p>
		{#if refusal}
			<p id={errorId} class="page-command-drawer-error" role="alert">{refusal}</p>
		{/if}
		<div class="mt-3 grid grid-cols-1 gap-3 text-left" data-manual-form>
			<div class="min-w-0">
				<label for={observedId} class="form-label block text-xs">
					Observation <span class="text-red-500">*</span>
				</label>
				<Textarea
					id={observedId}
					name="manual-observation"
					rows={4}
					maxlength={100000}
					bind:value={observed}
					disabled={working}
					class="form-input"
					aria-describedby={refusal ? errorId : undefined}
				/>
			</div>
			<div class="min-w-0 sm:max-w-xs">
				<label for={resultId} class="form-label block text-xs">
					Result <span class="text-red-500">*</span>
				</label>
				<Select
					id={resultId}
					name="manual-result"
					items={RESULTS}
					placeholder="Select a result"
					bind:value={result}
					disabled={working}
					class="form-input"
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
