<!--
	Who holds a Role: one line per person, with a quiet trash icon to take
	them out, and a picker to add someone. Presentation only: Remove raises
	an intent the host confirms where its confirmations go (the command bar),
	and Add hands the chosen person to the host, which performs both.

	A platform-managed Role is read-only here (`editable` false): no trash,
	no picker.
-->
<script lang="ts">
	import { Button, Select } from 'flowbite-svelte';
	import { TrashBinOutline } from 'flowbite-svelte-icons';
	import CardContainer from '../primitives/CardContainer.svelte';
	import IconButton from '../primitives/IconButton.svelte';
	import type { RoleMemberItem } from './types';

	let {
		roleName,
		members,
		candidates = [],
		editable = true,
		busy = false,
		onremove,
		onadd,
		title = 'Who holds it',
		emptyText = 'Nobody holds this Role yet.',
		addPlaceholder = 'Add someone',
		addLabel = 'Add'
	}: {
		roleName: string;
		members: RoleMemberItem[];
		/** People who may be added (members of the tenant not holding it). */
		candidates?: RoleMemberItem[];
		editable?: boolean;
		busy?: boolean;
		onremove?: (member: RoleMemberItem) => void;
		onadd?: (ref: string) => void;
		title?: string;
		emptyText?: string;
		addPlaceholder?: string;
		addLabel?: string;
	} = $props();

	// Undefined, not '': flowbite's Select shows its placeholder only then. A
	// pick that left the candidates (just added) goes back to it.
	let pick = $state<string | undefined>(undefined);
	$effect(() => {
		if (pick && !candidates.some((c) => c.ref === pick)) pick = undefined;
	});
</script>

<CardContainer {title}>
	<span slot="header" class="text-[11px] tabular-nums text-gray-500 dark:text-gray-400">{members.length}</span>
	<svelte:fragment slot="content">
		<div data-role-members>
			{#if members.length === 0}
				<p class="py-3 text-center text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>
			{:else}
				<ul class="divide-y divide-gray-100 dark:divide-gray-800">
					{#each members as member (member.ref)}
						<li class="flex items-center justify-between gap-3 py-1.5 text-sm">
							<span class="min-w-0">
								<span class="block truncate text-gray-800 dark:text-gray-200">{member.label}</span>
								{#if member.detail}
									<span class="block truncate text-[11px] text-gray-500 dark:text-gray-400">{member.detail}</span>
								{/if}
							</span>
							{#if editable && onremove}
								<IconButton
									icon={TrashBinOutline}
									label={`Remove ${member.label} from ${roleName}`}
									tone="danger"
									disabled={busy}
									onclick={() => onremove?.(member)}
								/>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			{#if editable && onadd && candidates.length > 0}
				<div class="mt-3 flex items-end gap-2">
					<Select
						bind:value={pick}
						placeholder={addPlaceholder}
						class="w-full max-w-sm"
						size="sm"
						items={candidates.map((c) => ({ value: c.ref, name: c.label }))}
						disabled={busy}
					/>
					<Button
						size="sm"
						color="alternative"
						disabled={!pick || busy}
						onclick={() => {
							if (pick) onadd?.(pick);
						}}>{addLabel}</Button
					>
				</div>
			{/if}
		</div>
	</svelte:fragment>
</CardContainer>
