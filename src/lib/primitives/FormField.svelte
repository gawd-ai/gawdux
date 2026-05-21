<script lang="ts">
	import { Label } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';

	export let id: string;
	export let label: string;
	export let error: string | null | undefined = null;
	export let required = false;
	export let className = '';

	$: message = error?.trim() ?? '';
	$: invalid = message.length > 0;
	$: errorId = `${id}-error`;
	$: describedBy = invalid ? errorId : undefined;
	$: invalidClass = invalid
		? '!border-red-400 dark:!border-red-700 !bg-red-50 dark:!bg-red-950/30'
		: '';
</script>

<div class="form-field {className}" data-field-invalid={invalid ? 'true' : undefined}>
	<div class="mb-1 flex items-center gap-2">
		<Label for={id} class="form-label !mb-0">{label}</Label>
		{#if required}
			<span
				class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
			>
				Required
			</span>
		{/if}
	</div>
	<slot {invalid} errorId={describedBy} {invalidClass} />
	{#if invalid}
		<div
			id={errorId}
			data-field-error-message
			tabindex="-1"
			class="mt-1 flex items-center gap-1.5 text-xs text-red-700 dark:text-red-300"
			role="alert"
		>
			<ExclamationCircleOutline class="h-3.5 w-3.5 shrink-0" />
			<span>{message}</span>
		</div>
	{/if}
</div>
