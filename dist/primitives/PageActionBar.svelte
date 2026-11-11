<script context="module" lang="ts">
	import type { PageTabScope } from './page-chrome';

	// Icon descriptors accept any Svelte component constructor — Flowbite icons
	// are typed via Svelte 5's `Component<OutlineProps, …>` shape, which doesn't
	// extend the older `SvelteComponent` class, so we widen rather than narrow.
	// `Permish` matches the boolean-ish values pages already produce
	// (`canX` props that may be `boolean | null | undefined`); we filter with
	// `!== false` so missing/null/undefined all read as visible.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type IconComponent = any;
	type Permish = boolean | null | undefined;

	export type LifecycleAction = (
		| {
				kind: 'add';
				label: string;
				href?: string;
				onClick?: () => void;
				icon?: IconComponent;
				perm?: Permish;
				disabled?: boolean;
		  }
		| {
				kind: 'view';
				label: string;
				href: string;
				icon?: IconComponent;
				perm?: Permish;
				disabled?: boolean;
		  }
		| { kind: 'pdf'; href: string; label?: string; perm?: Permish; disabled?: boolean }
		| {
				kind: 'archive';
				table: string;
				id: string | number;
				archived: boolean;
				label?: string;
				restoreLabel?: string;
				perm?: Permish;
		  }
		| {
				kind: 'retire';
				table: string;
				id: string | number;
				retired: boolean;
				perm?: Permish;
		  }
		| {
				kind: 'status';
				label: string;
				tone: 'red' | 'green';
				icon?: IconComponent;
				onClick: () => void;
				perm?: Permish;
				disabled?: boolean;
		  }
		| {
				kind: 'custom';
				label: string;
				color?: 'blue' | 'red' | 'green';
				icon?: IconComponent;
				href?: string;
				onClick?: () => void;
				perm?: Permish;
				disabled?: boolean;
		  }
	) & {
		/** The tab, or tabs, this act belongs to (PAGE_TAB_CONTEXT): shown only
		    while one of them is open. None: the page's, on every tab. */
		tab?: PageTabScope;
	};

	export interface EditModeProps {
		/** The tab, or tabs, the record is edited on (PAGE_TAB_CONTEXT): Edit,
		    Cancel and Save show only while one of them is open. None: every tab. */
		tab?: PageTabScope;
		isEditing: boolean;
		canEdit: boolean;
		onEdit: () => void;
		onCancel: () => void;
		onSave: () => void;
		onSaveAsDraft?: () => void;
		showSaveAsDraft?: boolean;
		saveLabel?: string;
		saveAsDraftLabel?: string;
		/** When true, Cancel / Save / Save-as-Draft are disabled and Save labels swap to "Saving…". */
		saving?: boolean;
	}

	/** Component renderers for domain-coupled lifecycle kinds. Consumer apps
	    that emit `kind: 'archive' | 'retire'` actions supply concrete buttons
	    here (the bar avoids importing app-specific API/UI directly). When a
	    matching renderer is missing, the bar silently skips the action. */
	export type LifecycleKindRenderers = {
		archive?: IconComponent;
		retire?: IconComponent;
	};
</script>

<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import {
		PenOutline,
		BanOutline,
		CheckOutline,
		EyeOutline,
		PlusOutline,
		ClockOutline,
		FileLinesOutline
	} from 'flowbite-svelte-icons';
	import { getContext } from 'svelte';
	import { readable } from 'svelte/store';
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';
	import { PAGE_TAB_CONTEXT, showsOnTab, type PageTabHost } from './page-chrome';

	export let editMode: EditModeProps | null = null;
	export let lifecycle: LifecycleAction[] = [];
	export let kindRenderers: LifecycleKindRenderers = {};

	/* The bar holds the open tab's acts: an act that names its tab shows only
	   while that tab is open (PAGE_TAB_CONTEXT). */
	const tabs = getContext<PageTabHost | undefined>(PAGE_TAB_CONTEXT);
	const openTab = tabs?.open ?? readable<string | null>(null);
	$: onTab = (scope: EditModeProps['tab']) => !tabs || showsOnTab(scope, $openTab);
	$: visibleActions = lifecycle.filter((a) => a.perm !== false && onTab(a.tab));
	$: edit = editMode && onTab(editMode.tab) ? editMode : null;
	$: editing = edit?.isEditing === true;

	// Flowbite Button's on:click is typed as `(e: MouseEvent) => void`, so a
	// bare `() => void | undefined` from a descriptor doesn't satisfy it.
	// Default to a noop when omitted (e.g. an `add` with only `href`).
	const noop = () => {};
</script>

<PageCommandBarCenter>
	{#if editing && edit}
		<Button outline color="red" on:click={edit.onCancel} disabled={edit.saving}>
			<BanOutline class="top-action-icons" />Cancel
		</Button>
		{#if edit.showSaveAsDraft && edit.onSaveAsDraft}
			<Button outline color="blue" on:click={edit.onSaveAsDraft} disabled={edit.saving}>
				<ClockOutline class="top-action-icons" />{edit.saving
					? 'Saving…'
					: (edit.saveAsDraftLabel ?? 'Save as draft')}
			</Button>
		{/if}
		<Button outline color="green" on:click={edit.onSave} disabled={edit.saving}>
			<CheckOutline class="top-action-icons" />{edit.saving ? 'Saving…' : (edit.saveLabel ?? 'Save')}
		</Button>
	{:else}
		{#if edit?.canEdit}
			<Button outline color="blue" on:click={edit.onEdit}>
				<PenOutline class="top-action-icons" />Edit
			</Button>
		{/if}
		{#each visibleActions as action}
			{#if action.kind === 'add'}
				<Button
					outline
					color="blue"
					href={action.href}
					on:click={action.onClick ?? noop}
					disabled={action.disabled}
				>
					<svelte:component
						this={action.icon ?? PlusOutline}
						class="top-action-icons"
					/>{action.label}
				</Button>
			{:else if action.kind === 'view'}
				<Button outline color="blue" href={action.href} disabled={action.disabled}>
					<svelte:component
						this={action.icon ?? EyeOutline}
						class="top-action-icons"
					/>{action.label}
				</Button>
			{:else if action.kind === 'pdf'}
				<!-- A PDF is a document, not a page of the app: it opens in a new
				     tab so the operator keeps their place. -->
				<Button
					outline
					color="blue"
					href={action.href}
					target="_blank"
					rel="noopener"
					disabled={action.disabled}
				>
					<FileLinesOutline class="top-action-icons" />{action.label ?? 'PDF'}
				</Button>
			{:else if action.kind === 'archive' && kindRenderers.archive}
				<svelte:component
					this={kindRenderers.archive}
					table={action.table}
					id={action.id}
					archived={action.archived}
					label={action.label ?? 'Archive'}
					restoreLabel={action.restoreLabel ?? 'Restore'}
				/>
			{:else if action.kind === 'retire' && kindRenderers.retire}
				<svelte:component
					this={kindRenderers.retire}
					table={action.table}
					id={action.id}
					retired={action.retired}
				/>
			{:else if action.kind === 'status'}
				<Button outline color={action.tone} on:click={action.onClick} disabled={action.disabled}>
					{#if action.icon}
						<svelte:component this={action.icon} class="top-action-icons" />
					{/if}
					{action.label}
				</Button>
			{:else if action.kind === 'custom'}
				<Button
					outline
					color={action.color ?? 'blue'}
					href={action.href}
					on:click={action.onClick ?? noop}
					disabled={action.disabled}
				>
					{#if action.icon}
						<svelte:component this={action.icon} class="top-action-icons" />
					{/if}
					{action.label}
				</Button>
			{/if}
		{/each}
	{/if}
</PageCommandBarCenter>
