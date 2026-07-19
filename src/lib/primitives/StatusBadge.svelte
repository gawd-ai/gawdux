<!--
    Presentation-only status badge. Consumers compute the {color, label}
    pair from their own domain status taxonomy and pass it in. This
    keeps gawdux free of any caller's status vocabulary.
-->
<script context="module" lang="ts">
	export type StatusBadgeColor =
		| 'green'
		| 'red'
		| 'dark'
		| 'blue'
		| 'yellow'
		| 'indigo'
		| 'purple';
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export let color: StatusBadgeColor;
	export let label: string;
	export let rounded: boolean = true;

	let className: string = '';
	export { className as class };

	const colorClasses: Record<StatusBadgeColor, string> = {
		green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		dark: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
		blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
		purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
	};

	$: baseClass = `inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium ${colorClasses[color]} ${rounded ? 'rounded-full' : 'rounded'}`;
	$: badgeClass = className ? twMerge(baseClass, className) : baseClass;
</script>

<span class={badgeClass}>{label}</span>
