<!--
	A member's access: the Roles they hold and what those Roles let them do.

	Adding and removing are INTENTS: the host performs the write and hands the
	new state back. Controls render only when the host both grants `canEdit`
	and supplies the handler, so a viewer who cannot change access sees a
	read-only card rather than buttons the server would refuse. A
	platform-managed Role is never removable here.
-->
<script lang="ts">
	import { Badge, Button, Select } from 'flowbite-svelte';
	import CardContainer from '../primitives/CardContainer.svelte';
	import {
		DEFAULT_MEMBER_ACCESS_COPY,
		type MemberAccessCopy,
		type MemberCapabilityGroup,
		type MemberRole
	} from './types';

	let {
		roles,
		candidates = [],
		capabilityGroups = [],
		capabilityNote = null,
		canEdit = false,
		busy = false,
		roleHref,
		onadd,
		onremove,
		copy: copyOverrides = {}
	}: {
		roles: MemberRole[];
		/** Roles this member could be added to. */
		candidates?: MemberRole[];
		capabilityGroups?: MemberCapabilityGroup[];
		/** Replaces the capability list, e.g. for a grade that holds everything. */
		capabilityNote?: string | null;
		canEdit?: boolean;
		/** A write is in flight: every control is inert. */
		busy?: boolean;
		roleHref?: (id: number) => string;
		onadd?: (roleId: number) => void;
		onremove?: (roleId: number) => void;
		copy?: Partial<MemberAccessCopy>;
	} = $props();

	const copy = $derived({ ...DEFAULT_MEMBER_ACCESS_COPY, ...copyOverrides });
	const canAdd = $derived(canEdit && typeof onadd === 'function' && candidates.length > 0);
	const canRemove = $derived(canEdit && typeof onremove === 'function');
	let pick = $state('');
	const items = $derived(candidates.map((r) => ({ value: String(r.id), name: r.name })));

	function add() {
		const id = Number(pick);
		if (!Number.isInteger(id) || id <= 0 || !onadd) return;
		onadd(id);
		pick = '';
	}
</script>

<div class="grid grid-cols-1 gap-3 xl:grid-cols-2" data-member-access>
	<CardContainer title={copy.rolesTitle}>
		<span slot="header" class="text-[11px] text-gray-500 dark:text-gray-400">{roles.length}</span>
		<svelte:fragment slot="content">
			{#if roles.length === 0}
				<div class="py-4 text-center text-sm text-gray-400">{copy.noRoles}</div>
			{:else}
				<div class="divide-y divide-gray-100 dark:divide-gray-800">
					{#each roles as role (role.id)}
						<div class="flex items-center justify-between gap-3 py-2" data-role-row={role.id}>
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									{#if roleHref}
										<a
											href={roleHref(role.id)}
											class="truncate text-sm font-medium text-gray-900 hover:underline dark:text-white"
											>{role.name}</a
										>
									{:else}
										<span class="truncate text-sm font-medium text-gray-900 dark:text-white"
											>{role.name}</span
										>
									{/if}
									{#if role.system}<Badge color="none">{copy.system}</Badge>{/if}
								</div>
								{#if role.description}
									<div class="truncate text-[11px] text-gray-500 dark:text-gray-400">
										{role.description}
									</div>
								{/if}
							</div>
							{#if canRemove && !role.system}
								<Button
									size="xs"
									outline
									color="red"
									disabled={busy}
									onclick={() => onremove?.(role.id)}>{copy.remove}</Button
								>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
			{#if canAdd}
				<div class="mt-3 flex items-center gap-2">
					<Select
						size="sm"
						class="flex-1"
						placeholder={copy.addPlaceholder}
						{items}
						bind:value={pick}
						disabled={busy}
					/>
					<Button size="sm" outline color="blue" disabled={busy || !pick} onclick={add}
						>{copy.add}</Button
					>
				</div>
			{/if}
		</svelte:fragment>
	</CardContainer>

	<CardContainer title={copy.capabilitiesTitle}>
		<svelte:fragment slot="content">
			{#if capabilityNote}
				<div class="py-2 text-sm text-gray-600 dark:text-gray-300">{capabilityNote}</div>
			{:else if capabilityGroups.length === 0}
				<div class="py-4 text-center text-sm text-gray-400">{copy.noCapabilities}</div>
			{:else}
				<div class="space-y-3">
					{#each capabilityGroups as group (group.id)}
						<div>
							<div class="mb-1 text-[11px] font-semibold uppercase text-gray-400">{group.label}</div>
							<div class="flex flex-wrap gap-1.5">
								{#each group.capabilities as capability (capability.id)}
									<Badge color="dark" title={capability.id}>{capability.label}</Badge>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</svelte:fragment>
	</CardContainer>
</div>
