<script lang="ts">
	import { Tabs } from 'flowbite-svelte';
	import { tick } from 'svelte';
	export let className: string = 'w-full tabs-underline tabs-stick';
	export let contentClass: string = 'tab-content scroll-surface !mt-0 rounded-b-lg';
	export let shellClass: string = 'page-tabs-shell';
	export let divider = false;
	export let panelId: string | undefined = undefined;
	export let panelLabelledBy: string | undefined = undefined;

	function wirePanel(node: HTMLElement, options: { id?: string; labelledBy?: string }) {
		async function apply(next: { id?: string; labelledBy?: string }) {
			await tick();
			const panel = node.querySelector<HTMLElement>('[role="tabpanel"]');
			if (!panel) return;
			if (next.id) panel.id = next.id;
			if (next.labelledBy) panel.setAttribute('aria-labelledby', next.labelledBy);
		}
		void apply(options);
		return { update: (next: { id?: string; labelledBy?: string }) => void apply(next) };
	}
</script>

<div
	class="context-surface {shellClass}"
	use:wirePanel={{ id: panelId, labelledBy: panelLabelledBy }}
>
	<Tabs tabStyle="underline" class={`page-tabs-list ${className}`} {contentClass} {divider}>
		<slot />
	</Tabs>
</div>
