<!-- Filter controls for the alert list: environment/plane scope selects,
     state + severity multi-toggles, service narrowing, and text search.
     Emits the next AlertOpsFilters object on every control change — the
     HOST applies the filters and passes filtered data back down; nothing is
     filtered client-side here. Every control is labelled and reachable by
     keyboard. -->
<script lang="ts">
	import { untrack } from 'svelte';
	import SearchInput from '../primitives/SearchInput.svelte';
	import {
		resolveAlertOpsCopy,
		type AlertOpsCopy,
		type AlertOpsFilters,
		type AlertOpsScope
	} from './types';

	let {
		scope,
		filters = $bindable({}),
		copy: copyOverrides,
		disabled = false,
		onchange
	}: {
		scope: AlertOpsScope;
		filters?: AlertOpsFilters;
		copy?: Partial<AlertOpsCopy>;
		disabled?: boolean;
		onchange?: (filters: AlertOpsFilters) => void;
	} = $props();

	const copy = $derived(resolveAlertOpsCopy(copyOverrides));
	const instanceId = $props.id();

	const STATE_OPTIONS = ['firing', 'resolved', 'suppressed'] as const;
	const SEVERITY_OPTIONS = ['critical', 'warning', 'info'] as const;

	const stateLabels = $derived<Record<string, string>>({
		firing: copy.statusFiring,
		resolved: copy.statusResolved,
		suppressed: copy.statusSuppressed
	});
	const severityLabels = $derived<Record<string, string>>({
		critical: copy.severityCritical,
		warning: copy.severityWarning,
		info: copy.severityInfo
	});

	// SearchInput needs a bindable draft; external filter resets sync back in.
	let textDraft = $state('');
	$effect(() => {
		const text = filters.text ?? '';
		untrack(() => {
			if (textDraft !== text) textDraft = text;
		});
	});

	function apply(next: AlertOpsFilters): void {
		filters = next;
		onchange?.(next);
	}

	function setScalar(key: 'environmentId' | 'planeId' | 'service' | 'text', value: string): void {
		const next: AlertOpsFilters = { ...filters };
		if (value.trim() !== '') next[key] = value;
		else delete next[key];
		apply(next);
	}

	function toggleValue(key: 'states' | 'severities', value: string): void {
		const current = filters[key] ?? [];
		const toggled = current.includes(value)
			? current.filter((entry) => entry !== value)
			: [...current, value];
		const next: AlertOpsFilters = { ...filters };
		if (toggled.length > 0) next[key] = toggled;
		else delete next[key];
		apply(next);
	}

	const labelClass = 'text-xs font-medium text-gray-600 dark:text-gray-300';
	const selectClass =
		'h-10 rounded border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
	const inputClass =
		'h-10 w-full rounded border border-gray-200 bg-white px-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

	function toggleClass(pressed: boolean): string {
		const base =
			'inline-flex min-h-9 items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60';
		return pressed
			? `${base} border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200`
			: `${base} border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800`;
	}
</script>

<section
	class="alert-ops-filter-rail"
	aria-label={copy.filtersLabel}
	data-testid="alert-ops-filter-rail"
>
	<div class="flex flex-wrap items-end gap-3">
		<div class="filter-field flex min-w-40 flex-col gap-1">
			<label class={labelClass} for="{instanceId}-environment">{copy.filterEnvironmentLabel}</label>
			<select
				id="{instanceId}-environment"
				class={selectClass}
				{disabled}
				value={filters.environmentId ?? ''}
				onchange={(event) => setScalar('environmentId', event.currentTarget.value)}
			>
				<option value="">{copy.filterAnyOptionLabel}</option>
				{#each scope.environments as environment (environment.id)}
					<option value={environment.id}>{environment.label}</option>
				{/each}
			</select>
		</div>

		<div class="filter-field flex min-w-40 flex-col gap-1">
			<label class={labelClass} for="{instanceId}-plane">{copy.filterPlaneLabel}</label>
			<select
				id="{instanceId}-plane"
				class={selectClass}
				{disabled}
				value={filters.planeId ?? ''}
				onchange={(event) => setScalar('planeId', event.currentTarget.value)}
			>
				<option value="">{copy.filterAnyOptionLabel}</option>
				{#each scope.planes as plane (plane.id)}
					<option value={plane.id}>{plane.label}</option>
				{/each}
			</select>
		</div>

		<div class="filter-field flex flex-col gap-1" role="group" aria-label={copy.filterStateLabel}>
			<span class={labelClass} aria-hidden="true">{copy.filterStateLabel}</span>
			<div class="flex flex-wrap gap-1">
				{#each STATE_OPTIONS as option (option)}
					{@const pressed = filters.states?.includes(option) ?? false}
					<button
						type="button"
						class={toggleClass(pressed)}
						aria-pressed={pressed}
						{disabled}
						onclick={() => toggleValue('states', option)}
					>
						{stateLabels[option]}
					</button>
				{/each}
			</div>
		</div>

		<div
			class="filter-field flex flex-col gap-1"
			role="group"
			aria-label={copy.filterSeverityLabel}
		>
			<span class={labelClass} aria-hidden="true">{copy.filterSeverityLabel}</span>
			<div class="flex flex-wrap gap-1">
				{#each SEVERITY_OPTIONS as option (option)}
					{@const pressed = filters.severities?.includes(option) ?? false}
					<button
						type="button"
						class={toggleClass(pressed)}
						aria-pressed={pressed}
						{disabled}
						onclick={() => toggleValue('severities', option)}
					>
						{severityLabels[option]}
					</button>
				{/each}
			</div>
		</div>

		<div class="filter-field flex min-w-36 flex-col gap-1">
			<label class={labelClass} for="{instanceId}-service">{copy.filterServiceLabel}</label>
			<input
				id="{instanceId}-service"
				type="text"
				class={inputClass}
				placeholder={copy.filterServicePlaceholder}
				autocomplete="off"
				{disabled}
				value={filters.service ?? ''}
				oninput={(event) => setScalar('service', event.currentTarget.value)}
			/>
		</div>

		<div class="filter-field-flex-1 min-w-48">
			<SearchInput
				id="{instanceId}-text"
				size="standard"
				bind:value={textDraft}
				placeholder={copy.filterTextPlaceholder}
				ariaLabel={copy.filterTextLabel}
				{disabled}
				oninput={() => setScalar('text', textDraft)}
				onclear={() => setScalar('text', '')}
				onsubmit={(value) => setScalar('text', value)}
			/>
		</div>
	</div>
</section>
