<script context="module" lang="ts">
	// Icon descriptors accept any Svelte component constructor — Flowbite icons
	// are typed via Svelte 5's `Component<OutlineProps, …>` shape, which doesn't
	// extend the older `SvelteComponent` class, so we widen rather than narrow.
	// `Permish` matches the boolean-ish values pages already produce
	// (`canX` props that may be `boolean | null | undefined`); we filter with
	// `!== false` so missing/null/undefined all read as visible.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type IconComponent = any;
	type Permish = boolean | null | undefined;

	export type LifecycleAction =
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
		  };

	export interface EditModeProps {
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
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';

	export let editMode: EditModeProps | null = null;
	export let lifecycle: LifecycleAction[] = [];
	export let kindRenderers: LifecycleKindRenderers = {};

	$: visibleActions = lifecycle.filter((a) => a.perm !== false);
	$: editing = editMode?.isEditing === true;

	// Flowbite Button's on:click is typed as `(e: MouseEvent) => void`, so a
	// bare `() => void | undefined` from a descriptor doesn't satisfy it.
	// Default to a noop when omitted (e.g. an `add` with only `href`).
	const noop = () => {};
</script>

<PageCommandBarCenter>
	{#if editing && editMode}
		<Button outline color="red" on:click={editMode.onCancel} disabled={editMode.saving}>
			<BanOutline class="top-action-icons" />Cancel
		</Button>
		{#if editMode.showSaveAsDraft && editMode.onSaveAsDraft}
			<Button outline color="blue" on:click={editMode.onSaveAsDraft} disabled={editMode.saving}>
				<ClockOutline class="top-action-icons" />{editMode.saving
					? 'Saving…'
					: (editMode.saveAsDraftLabel ?? 'Save as Draft')}
			</Button>
		{/if}
		<Button outline color="green" on:click={editMode.onSave} disabled={editMode.saving}>
			<CheckOutline class="top-action-icons" />{editMode.saving
				? 'Saving…'
				: (editMode.saveLabel ?? 'Save')}
		</Button>
	{:else}
		{#if editMode?.canEdit}
			<Button outline color="blue" on:click={editMode.onEdit}>
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
				<Button outline color="blue" href={action.href} disabled={action.disabled}>
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
