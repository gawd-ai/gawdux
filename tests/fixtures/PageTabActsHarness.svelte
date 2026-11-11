<!--
	A tabbed page in a scaffold: its tab strip reports the open tab, and its
	acts name their tabs. The Content tab holds Edit details and PDF, the
	Workflow tab Submit for review and Discard revision, History nothing; an
	edit bar's Edit belongs to Details. A decision opened from Workflow's bar
	is a drawer that closes when the tab changes.
-->
<script lang="ts">
	import { setContext } from 'svelte';
	import { TabItem } from 'flowbite-svelte';
	import EditablePageScaffold from '../../src/lib/primitives/EditablePageScaffold.svelte';
	import PageTabs from '../../src/lib/primitives/PageTabs.svelte';
	import PageCommandBar from '../../src/lib/primitives/PageCommandBar.svelte';
	import PageCommandBarCenter from '../../src/lib/primitives/PageCommandBarCenter.svelte';
	import PageCommandBarConfirm from '../../src/lib/primitives/PageCommandBarConfirm.svelte';
	import CommandDrawer from '../../src/lib/primitives/CommandDrawer.svelte';
	import { createPageCommandBarRegistry } from '../../src/lib/primitives/page-command-bar-registry';
	import {
		PAGE_COMMAND_BAR_CONTEXT,
		type PageCommandBarSlots
	} from '../../src/lib/primitives/page-chrome';

	let slots = $state<PageCommandBarSlots>({ left: null, center: null, right: null });
	setContext(
		PAGE_COMMAND_BAR_CONTEXT,
		createPageCommandBarRegistry((zone, snippet) => {
			slots[zone] = snippet;
		})
	);

	const TABS = ['content', 'workflow', 'history'] as const;
	let tab = $state<(typeof TABS)[number]>('content');
	let drawer = $state(false);
	let confirm = $state(false);
	let scaffoldActs = $state(false);
	let closedBy = $state<string[]>([]);

	export function open(next: (typeof TABS)[number]) {
		tab = next;
	}
	export function openDrawer() {
		drawer = true;
	}
	export function openConfirm() {
		confirm = true;
	}
	export function useScaffoldActs(next: boolean) {
		scaffoldActs = next;
	}
	export function closes() {
		return closedBy;
	}
	export function drawerOpen() {
		return drawer;
	}
	export function confirmOpen() {
		return confirm;
	}
</script>

<EditablePageScaffold
	editMode={scaffoldActs
		? {
				tab: 'content',
				isEditing: false,
				canEdit: true,
				onEdit: () => {},
				onCancel: () => {},
				onSave: () => {}
			}
		: null}
	lifecycle={scaffoldActs
		? [
				{ kind: 'add', label: 'Add spec', onClick: () => {}, tab: 'content' },
				{ kind: 'pdf', href: '/x.pdf', tab: ['content', 'workflow'] }
			]
		: []}
>
	<PageTabs openTab={tab}>
		{#each TABS as id (id)}
			<TabItem open={tab === id} title={id} on:click={() => (tab = id)}><p>{id}</p></TabItem>
		{/each}
	</PageTabs>

	{#if !scaffoldActs}
		<PageCommandBarCenter tab="content">
			<button type="button">Edit details</button>
			<button type="button">PDF</button>
		</PageCommandBarCenter>
		<PageCommandBar tab="workflow"><span>1 of 2 signatures</span></PageCommandBar>
		<PageCommandBarCenter tab="workflow">
			<button type="button">Submit for review</button>
			<button type="button">Discard revision</button>
		</PageCommandBarCenter>
	{/if}

	<CommandDrawer
		open={drawer}
		onclose={() => {
			drawer = false;
			closedBy = [...closedBy, 'drawer'];
		}}
	>
		<p>Submit for review</p>
	</CommandDrawer>
	{#if confirm}
		<PageCommandBarConfirm
			title="Discard the revision?"
			confirmLabel="Discard revision"
			onconfirm={() => {}}
			oncancel={() => {
				confirm = false;
				closedBy = [...closedBy, 'confirm'];
			}}
		/>
	{/if}
</EditablePageScaffold>

<div data-zone="left">{@render slots.left?.()}</div>
<div data-zone="center">{@render slots.center?.()}</div>
<div data-zone="right">{@render slots.right?.()}</div>
