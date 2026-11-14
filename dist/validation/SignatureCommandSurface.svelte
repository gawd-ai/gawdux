<!--
	SignatureCommandSurface: the sign drawer. An electronic signature is a
	decision the signer makes at the command bar: the drawer rises out of the
	bar (CommandDrawer) and holds the statement, what follows from the
	signature, the signer, the password and the reason; Cancel and the confirm
	take the bar's center zone in place of the page's actions
	(PageCommandBarPair). Nothing is modal. A field the signature carries (a
	later approval's revision, `fields`) is part of what is signed and comes
	before the password and the reason; nothing is drawn under them but the
	reason's rule, so the drawer states each fact once.

	The password is entered again for every signature, as the rules for
	electronic records ask; the host's signature service checks it, records a
	wrong attempt, and stores the signer's name, the meaning, the time and the
	hash of what was signed. The drawer signs nothing itself: it hands the
	password and the reason to `onconfirm`. Every refusal shows inside the
	drawer, which stays open, and returns focus to the password; a refused
	password (`errorReason` "password_incorrect") marks the field.

	Escape closes the drawer and nothing else, and does nothing while a write
	is in flight. A result the page could not confirm holds the confirm only
	(`confirmDisabled`), so the drawer still closes. The password and the
	reason are cleared on every close.
-->
<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { Input } from 'flowbite-svelte';
	import CommandDrawer from '../primitives/CommandDrawer.svelte';
	import PageCommandBarPair from '../primitives/PageCommandBarPair.svelte';

	let {
		open,
		title,
		statement,
		consequence = null,
		signer,
		confirmLabel,
		busyLabel = 'Signing…',
		tone = 'blue',
		reasonLabel = 'Reason for signing',
		reasonMin = 10,
		busy = false,
		confirmDisabled = false,
		error = null,
		errorReason = null,
		fields,
		onclose,
		onconfirm
	}: {
		open: boolean;
		/** The drawer's heading: "Sign: QA review". */
		title: string;
		/** `signatureStatement({ step, subject, meaning })`, or the host's own sentence. */
		statement: string;
		/** What the signature does beyond itself: it completes the record, it approves the document. */
		consequence?: string | null;
		signer: { name: string; email: string };
		confirmLabel: string;
		busyLabel?: string;
		/** Red for a withdrawal. */
		tone?: 'blue' | 'red';
		reasonLabel?: string;
		/**
		 * The reason's least length, 10 by default, stated before the button
		 * would refuse. 1 makes the reason required with no stated length; 0
		 * makes it optional, "(optional)" in its label.
		 */
		reasonMin?: number;
		/** A write in flight: the drawer holds still, Escape and Cancel included. */
		busy?: boolean;
		/**
		 * A result the page could not confirm (its answer was lost): only the
		 * confirm is held. The drawer stays closable, so the signer closes it
		 * and checks before signing again.
		 */
		confirmDisabled?: boolean;
		error?: string | null;
		/** The host's refusal kind for `error` (`password_incorrect` marks the field). */
		errorReason?: string | null;
		/**
		 * A field the signature carries, part of what is signed, drawn before
		 * the password and the reason in the drawer's one column: a later
		 * approval's revision.
		 */
		fields?: Snippet | undefined;
		onclose: () => void;
		onconfirm: (input: { password: string; reason: string }) => void;
	} = $props();

	const componentId = $props.id();
	const titleId = `${componentId}-title`;
	const messageId = `${componentId}-message`;
	const passwordId = `${componentId}-password`;
	const errorId = `${componentId}-error`;
	const reasonId = `${componentId}-reason`;
	const ruleId = `${componentId}-rule`;

	let password = $state('');
	let reason = $state('');
	let wasOpen = false;
	let wasBusy = false;

	const trimmed = $derived(reason.trim());
	const reasonOk = $derived(trimmed.length >= reasonMin);
	const canSubmit = $derived(password.length > 0 && reasonOk);
	// The rule is read before the button refuses: stated under the empty
	// field, counted while the reason is too short. A one-character minimum is
	// only "required", which the label's mark already says.
	const rule = $derived(
		reasonMin <= 1 || reasonOk
			? null
			: trimmed.length === 0
				? `At least ${reasonMin} characters.`
				: `At least ${reasonMin} characters (${trimmed.length} so far).`
	);
	const passwordRefused = $derived(error !== null && errorReason === 'password_incorrect');

	// A password never lingers in the page after the decision, whichever way
	// it went.
	$effect(() => {
		if (!open && wasOpen) {
			password = '';
			reason = '';
		}
		wasOpen = open;
	});

	// Focus follows the refusal. The fields are disabled while the signature
	// is in flight, which drops focus; a refusal returns it to the password,
	// so a refused password shows its mark (the house ring on an invalid field
	// is drawn on focus) and a retry is one keystroke away.
	$effect(() => {
		const nowBusy = busy;
		if (open && wasBusy && !nowBusy && error !== null)
			void tick().then(() => passwordField()?.focus());
		wasBusy = nowBusy;
	});

	function passwordField(): HTMLInputElement | null {
		return document.getElementById(passwordId) as HTMLInputElement | null;
	}

	// Escape closes the drawer and nothing else: taken in the window's capture
	// phase and stopped there, so the page behind (a viewer, a dock) never
	// sees it. While a write is in flight it does nothing.
	$effect(() => {
		if (!open) return;
		const onEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.isComposing) return;
			event.preventDefault();
			event.stopImmediatePropagation();
			if (!busy) onclose();
		};
		window.addEventListener('keydown', onEscape, true);
		return () => window.removeEventListener('keydown', onEscape, true);
	});

	function close() {
		if (!busy) onclose();
	}

	function submit() {
		if (busy || confirmDisabled || !canSubmit) return;
		onconfirm({ password, reason: trimmed });
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || event.isComposing) return;
		event.preventDefault();
		if (tone === 'blue') submit();
	}
</script>

<!-- Escape is taken above, in the window's capture phase, so the drawer's own
     Escape never sees it; the drawer still closes when the page's open tab
     changes, its act having left the bar. -->
<CommandDrawer
	{open}
	{busy}
	labelledBy={titleId}
	describedBy={messageId}
	autoFocusSelector="input[name='signature-password']"
	maxHeight="32rem"
	data-sign-drawer
	onclose={close}
>
	<div class="mx-auto w-full max-w-3xl">
		<h3 id={titleId} class="page-command-drawer-title">{title}</h3>
		<p id={messageId} class="page-command-drawer-message" data-sign-statement>
			{statement}
			{#if consequence}<span data-sign-consequence>{consequence}</span>{/if}
		</p>
		<p class="page-command-drawer-message" data-sign-signer>
			Signing as <span class="font-medium text-gray-900 dark:text-gray-100">{signer.name}</span> ·
			{signer.email}
		</p>
		{#if error}
			<p id={errorId} class="page-command-drawer-error" role="alert">{error}</p>
		{/if}
		<div class="mt-3 grid grid-cols-1 gap-3 text-left sm:grid-cols-2" data-sign-form>
			{#if fields}
				<div class="min-w-0 sm:col-span-2" data-sign-fields>
					{@render fields()}
				</div>
			{/if}
			<div class="min-w-0">
				<label for={passwordId} class="form-label block text-xs">Password</label>
				<!--
					The signer's account, for the password manager only.

					A password field with no username field beside it makes a
					browser search the document for one, and it takes the nearest
					text input before it: on a page with a search box above the
					drawer, signing filled the search with the signer's email.
					`autocomplete="off"` on the search input does not stop it.

					So the field it looks for is given to it, holding the account it
					is about to check. Read-only and out of the tab order: it is not
					something to fill in, the drawer already prints the address above,
					and it must never look like a sign-in. It is rendered, not
					`hidden`: a display:none input is skipped by the same search.
				-->
				<input
					class="sr-only"
					type="text"
					name="username"
					autocomplete="username"
					value={signer.email}
					readonly
					tabindex="-1"
					aria-hidden="true"
				/>
				<Input
					type="password"
					id={passwordId}
					name="signature-password"
					autocomplete="current-password"
					bind:value={password}
					disabled={busy}
					class="form-input"
					aria-invalid={passwordRefused ? 'true' : undefined}
					aria-describedby={passwordRefused ? errorId : undefined}
					data-sign-password
					on:keydown={onKeydown}
				/>
			</div>
			<div class="min-w-0">
				<label for={reasonId} class="form-label block text-xs">
					{reasonLabel}
					{#if reasonMin > 0}<span class="text-red-500">*</span>{:else}<span
							class="text-gray-500 dark:text-gray-400">(optional)</span
						>{/if}
				</label>
				<Input
					type="text"
					id={reasonId}
					name="signature-reason"
					autocomplete="off"
					bind:value={reason}
					disabled={busy}
					class="form-input"
					aria-describedby={rule ? ruleId : undefined}
					on:keydown={onKeydown}
				/>
				{#if rule}
					<p id={ruleId} class="mt-1 text-xs text-gray-500 dark:text-gray-400" data-reason-rule>
						{rule}
					</p>
				{/if}
			</div>
		</div>
	</div>
</CommandDrawer>

{#if open}
	<!-- A typed reason is input; the password is not: Cancel is red only while
	     a reason would be dropped. -->
	<PageCommandBarPair
		label={confirmLabel}
		{busyLabel}
		{tone}
		{busy}
		disabled={confirmDisabled || !canSubmit}
		discards={trimmed.length > 0}
		describedBy={messageId}
		onact={submit}
		oncancel={close}
	/>
{/if}
