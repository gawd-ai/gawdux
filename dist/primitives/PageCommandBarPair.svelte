<!--
	PageCommandBarPair: a decision's action pair in the command bar, Cancel
	and the act, as a drawer and edit mode draw it.

	- One height, padding and type for both: the bar's button, the same size
	  whatever has focus. A focus ring shows only on keyboard focus, as an
	  outline that never changes a button's size (tokens.css, the bar's
	  button skin), so the act focused when a drawer opens reads the size of
	  the Cancel beside it.
	- The act's tone is its own: red for a destructive act, green for a save,
	  blue for any other.
	- Cancel is neutral: it goes back out of the decision. It turns red only
	  while cancelling would discard input the person entered (`discards`: a
	  field changed in edit mode or a form, a typed reason or note; a password
	  is not information), and is neutral again once that input is cleared.

	A host passes the act and whether input would be lost; it draws no Cancel
	of its own and sets no Cancel's colour.

	By default the pair takes the bar's center zone (PageCommandBarCenter, the
	page's open tab deciding through `tab`); `inline` renders it in place, for
	a host already rendering into the zone (PageActionBar's edit mode).
-->
<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';
	import type { PageTabScope } from './page-chrome';

	let {
		label,
		busyLabel = 'Applying…',
		tone = 'blue',
		busy = false,
		disabled = false,
		onact,
		cancelLabel = 'Cancel',
		discards = false,
		cancelDisabled = undefined,
		oncancel,
		between = undefined,
		actIcon = undefined,
		cancelIcon = undefined,
		describedBy = undefined,
		confirmFor = undefined,
		actAttributes = {},
		cancelAttributes = {},
		tab = undefined,
		inline = false
	}: {
		/** The act's label. */
		label: string;
		/** The act's label while it runs. */
		busyLabel?: string | undefined;
		/** The act's own tone: red for a destructive act, green for a save. */
		tone?: 'blue' | 'green' | 'red' | undefined;
		busy?: boolean | undefined;
		/** The act cannot run yet (a required field is empty). */
		disabled?: boolean | undefined;
		onact: () => void;
		/** Null hides Cancel: a result the person only acknowledges. */
		cancelLabel?: string | null | undefined;
		/** Cancelling would discard input the person entered: Cancel is red. */
		discards?: boolean | undefined;
		/** Defaults to `busy`: nothing is cancelled mid-write. */
		cancelDisabled?: boolean | undefined;
		oncancel: () => void;
		/** Other acts of the decision, drawn between Cancel and the act. */
		between?: Snippet | undefined;
		actIcon?: Component<{ class?: string }> | undefined;
		cancelIcon?: Component<{ class?: string }> | undefined;
		describedBy?: string | undefined;
		/** Ties the act to the decision that focuses it (`data-confirm-for`). */
		confirmFor?: string | undefined;
		/** A host's own markers on the act or on Cancel (test hooks). */
		actAttributes?: Record<string, string | boolean | undefined> | undefined;
		cancelAttributes?: Record<string, string | boolean | undefined> | undefined;
		tab?: PageTabScope;
		inline?: boolean | undefined;
	} = $props();

	const cancelTone = $derived(discards ? 'red' : 'neutral');
</script>

{#snippet pair()}
	{#if cancelLabel}
		<Button
			outline
			color={discards ? 'red' : 'alternative'}
			data-tone={cancelTone}
			data-action-cancel
			data-discards={discards ? 'true' : 'false'}
			{...cancelAttributes}
			disabled={cancelDisabled ?? busy}
			onclick={() => oncancel()}
		>
			{#if cancelIcon}{@const Icon = cancelIcon}<Icon class="top-action-icons" />{/if}{cancelLabel}
		</Button>
	{/if}
	{@render between?.()}
	<Button
		outline
		color={tone}
		data-tone={tone}
		data-action-confirm
		data-confirm-for={confirmFor}
		aria-describedby={describedBy}
		{...actAttributes}
		disabled={busy || disabled}
		onclick={() => onact()}
	>
		{#if actIcon}{@const Icon = actIcon}<Icon class="top-action-icons" />{/if}{busy
			? busyLabel
			: label}
	</Button>
{/snippet}

{#if inline}
	{@render pair()}
{:else}
	<PageCommandBarCenter {tab}>
		{@render pair()}
	</PageCommandBarCenter>
{/if}
