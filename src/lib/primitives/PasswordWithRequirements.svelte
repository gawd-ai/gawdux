<script module lang="ts">
	/** One live-checked requirement. Consumers own the rule list (and any
	 * server-side validation that mirrors it); the panel only renders and
	 * re-evaluates `test(value)` as the user types. */
	export interface PasswordRequirementRule {
		label: string;
		test: (value: string) => boolean;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Input, Label } from 'flowbite-svelte';
	import { CheckOutline, EyeOutline, EyeSlashOutline, LockSolid } from 'flowbite-svelte-icons';

	interface Props {
		value: string;
		/** Canonical password rules for this surface; checkmarks derive from it. */
		rules: readonly PasswordRequirementRule[];
		confirm?: string;
		label?: string;
		confirmLabel?: string;
		name?: string;
		confirmName?: string;
		showConfirm?: boolean;
		autocomplete?: 'new-password' | 'current-password';
		requirementsLabel?: string;
		ruleLabels?: readonly string[];
		confirmationRuleLabel?: string;
		showPasswordLabel?: string;
		hidePasswordLabel?: string;
		showConfirmationLabel?: string;
		hideConfirmationLabel?: string;
		/** In-app density: house `form-input` fields (no lock adornment) and a
		 * tighter requirements panel. Default keeps the pre-auth scale used by
		 * signup/invite/reset/change-password. */
		compact?: boolean;
		/** 'split' puts the requirements panel beside the fields on wide
		 * viewports instead of below them — for app surfaces where the stacked
		 * pre-auth arrangement reads as dead space. */
		layout?: 'stack' | 'split';
		/** Rendered above the password field inside the fields column (e.g. a
		 * current-password input on the self-serve profile page). */
		leading?: Snippet;
	}

	let {
		value = $bindable(''),
		rules,
		confirm = $bindable(''),
		label = 'Password',
		confirmLabel = 'Confirm password',
		name = 'password',
		confirmName = 'confirm',
		showConfirm = true,
		autocomplete = 'new-password',
		requirementsLabel = 'Requirements',
		ruleLabels = [],
		confirmationRuleLabel = 'Both passwords match',
		showPasswordLabel = `Show ${label.toLowerCase()}`,
		hidePasswordLabel = `Hide ${label.toLowerCase()}`,
		showConfirmationLabel = `Show ${confirmLabel.toLowerCase()}`,
		hideConfirmationLabel = `Hide ${confirmLabel.toLowerCase()}`,
		compact = false,
		layout = 'stack',
		leading
	}: Props = $props();

	let matches = $derived(showConfirm ? value.length > 0 && value === confirm : true);
	let passwordVisible = $state(false);
	let confirmationVisible = $state(false);

	let requirements = $derived([
		...rules.map((rule, index) => ({
			label: ruleLabels[index] ?? rule.label,
			met: rule.test(value)
		})),
		...(showConfirm ? [{ label: confirmationRuleLabel, met: matches }] : [])
	]);

	const labelClass = $derived(
		compact ? 'form-label' : 'mb-2 text-sm font-medium text-gray-700 dark:text-gray-200'
	);
	const inputClass = $derived(
		compact
			? 'form-input !pr-12 min-[1025px]:!pr-2'
			: 'h-11 border-gray-300 bg-white pl-10 pr-12 text-base text-gray-900 focus:border-gray-500 focus:ring-gray-500 min-[1025px]:pr-3 min-[1025px]:text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white'
	);
</script>

{#snippet fields()}
	{#if leading}
		{@render leading()}
	{/if}
	<div>
		<Label for={name} class={labelClass}>
			{label}
		</Label>
		<div class="relative">
			{#if !compact}
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<LockSolid class="h-5 w-5 text-gray-400 dark:text-gray-500" />
				</div>
			{/if}
			<Input
				type={passwordVisible ? 'text' : 'password'}
				{name}
				id={name}
				{autocomplete}
				autocapitalize="none"
				spellcheck="false"
				bind:value
				required
				class={inputClass}
			/>
			<button
				type="button"
				class="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-500 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500 min-[1025px]:hidden dark:text-gray-400 dark:hover:text-white"
				aria-label={passwordVisible ? hidePasswordLabel : showPasswordLabel}
				aria-controls={name}
				aria-pressed={passwordVisible}
				onclick={() => (passwordVisible = !passwordVisible)}
			>
				{#if passwordVisible}
					<EyeSlashOutline class="h-5 w-5" />
				{:else}
					<EyeOutline class="h-5 w-5" />
				{/if}
			</button>
		</div>
	</div>

	{#if showConfirm}
		<div>
			<Label for={confirmName} class={labelClass}>
				{confirmLabel}
			</Label>
			<div class="relative">
				{#if !compact}
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<LockSolid class="h-5 w-5 text-gray-400 dark:text-gray-500" />
					</div>
				{/if}
				<Input
					type={confirmationVisible ? 'text' : 'password'}
					name={confirmName}
					id={confirmName}
					{autocomplete}
					autocapitalize="none"
					spellcheck="false"
					bind:value={confirm}
					required
					class={inputClass}
				/>
				<button
					type="button"
					class="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-500 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500 min-[1025px]:hidden dark:text-gray-400 dark:hover:text-white"
					aria-label={confirmationVisible ? hideConfirmationLabel : showConfirmationLabel}
					aria-controls={confirmName}
					aria-pressed={confirmationVisible}
					onclick={() => (confirmationVisible = !confirmationVisible)}
				>
					{#if confirmationVisible}
						<EyeSlashOutline class="h-5 w-5" />
					{:else}
						<EyeOutline class="h-5 w-5" />
					{/if}
				</button>
			</div>
		</div>
	{/if}
{/snippet}

{#snippet rulesPanel()}
	<div
		class={compact
			? 'rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-800 dark:bg-gray-950'
			: 'rounded-xl border border-gray-200 bg-gray-50 p-3 min-[1025px]:p-4 dark:border-gray-800 dark:bg-gray-950'}
	>
		<div
			class={compact
				? 'mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'
				: 'mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400'}
		>
			{requirementsLabel}
		</div>
		<ul class={compact ? 'space-y-1.5' : 'space-y-2'}>
			{#each requirements as req}
				<li class="flex items-center gap-3 {compact ? 'gap-2 text-xs' : 'text-sm'}">
					<span
						class="flex shrink-0 items-center justify-center rounded-full transition-colors duration-150 {compact
							? 'h-4 w-4'
							: 'h-5 w-5'} {req.met
							? 'bg-green-500 text-white'
							: 'border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'}"
					>
						{#if req.met}
							<CheckOutline class={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth="3" />
						{/if}
					</span>
					<span
						class="transition-colors duration-150 {req.met
							? 'text-gray-900 dark:text-white'
							: 'text-gray-500 dark:text-gray-400'}"
					>
						{req.label}
					</span>
				</li>
			{/each}
		</ul>
	</div>
{/snippet}

{#if layout === 'split'}
	<div class="grid grid-cols-1 gap-4 min-[1025px]:grid-cols-2">
		<div class={compact ? 'space-y-3' : 'space-y-5'}>
			{@render fields()}
		</div>
		<div>
			{@render rulesPanel()}
		</div>
	</div>
{:else}
	<div class={compact ? 'space-y-3' : 'space-y-5'}>
		{@render fields()}
		{@render rulesPanel()}
	</div>
{/if}
