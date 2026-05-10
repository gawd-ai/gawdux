<script lang="ts">
	import { Tabs } from 'flowbite-svelte';
	export let className: string = 'w-full tabs-underline tabs-stick';
	export let contentClass: string = 'tab-content scroll-surface !mt-0 rounded-b-lg';
	export let shellClass: string = 'page-tabs-shell';
	export let divider = false;
</script>

<div class="context-surface {shellClass}">
	<Tabs tabStyle="underline" class={className} {contentClass} {divider}>
		<slot />
	</Tabs>
</div>
