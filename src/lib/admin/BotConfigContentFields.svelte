<!-- Field presentation only; the host owns validation, revision and commands. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Input, Label, Textarea, Toggle } from 'flowbite-svelte';

	let {
		name = $bindable(),
		body = $bindable(),
		enabled = $bindable(),
		maxBodyChars = 4000,
		maxNameChars = 120,
		disabled = false,
		idPrefix = 'bot-config',
		nameError = null,
		namePlaceholder,
		bodyPlaceholder,
		bodyLabel = 'Instructions',
		enabledLabel = 'Enabled',
		enabledAriaLabel,
		bodyRows = 10,
		bodyClass = '',
		nameRowClass = 'grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end',
		enabledClass = 'flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300',
		labelClass = 'mb-1 text-xs',
		bodyCounter,
		bodyHelp
	}: {
		name: string;
		body: string;
		enabled: boolean;
		maxBodyChars?: number;
		maxNameChars?: number;
		disabled?: boolean;
		idPrefix?: string;
		/** Already classified and worded by the host; no error inference. */
		nameError?: string | null;
		namePlaceholder?: string;
		bodyPlaceholder?: string;
		bodyLabel?: string;
		enabledLabel?: string;
		enabledAriaLabel?: string;
		bodyRows?: number;
		bodyClass?: string;
		nameRowClass?: string;
		enabledClass?: string;
		labelClass?: string;
		bodyCounter?: Snippet<[used: number, maximum: number]>;
		bodyHelp?: Snippet;
	} = $props();

	const remaining = $derived(maxBodyChars - body.length);
</script>

<div class={nameRowClass} data-bot-config-content>
	<div>
		<Label for={`${idPrefix}-name`} class={labelClass}>Name</Label>
		<Input
			id={`${idPrefix}-name`}
			name="name"
			required
			maxlength={maxNameChars}
			bind:value={name}
			{disabled}
			placeholder={namePlaceholder}
			aria-invalid={nameError ? true : undefined}
			aria-describedby={nameError ? `${idPrefix}-name-error` : undefined}
		/>
		{#if nameError}
			<p id={`${idPrefix}-name-error`} class="mt-1 text-xs text-red-600 dark:text-red-400">
				{nameError}
			</p>
		{/if}
	</div>
	<label class={enabledClass}>
		<Toggle
			name="enabled"
			value="true"
			bind:checked={enabled}
			{disabled}
			aria-label={enabledAriaLabel}
		/>
		{enabledLabel}
	</label>
</div>
<div>
	<Label for={`${idPrefix}-body`} class={`flex justify-between ${labelClass}`}>
		<span>{bodyLabel}</span>
		{#if bodyCounter}
			{@render bodyCounter(body.length, maxBodyChars)}
		{:else}
			<span class={remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}>
				{remaining} characters left
			</span>
		{/if}
	</Label>
	<Textarea
		id={`${idPrefix}-body`}
		name="body"
		rows={bodyRows}
		class={bodyClass}
		bind:value={body}
		{disabled}
		placeholder={bodyPlaceholder}
	/>
	{@render bodyHelp?.()}
</div>
