<!-- The header's trail of a document in its folder and of a record, as their
     loads state them and the shell draws them: the last level is the item
     its page's own header names. -->
<script lang="ts">
	import { ClipboardListOutline, FolderOutline } from 'flowbite-svelte-icons';
	import { createAppTrail } from '../../../src/lib/shell/app-trail';
	import Header from './ShellHeaderHarness.svelte';

	let { kind = 'document' }: { kind?: 'document' | 'record' } = $props();

	const { buildExplicitBreadcrumb } = createAppTrail({
		icons: { documents: FolderOutline, work: ClipboardListOutline },
		root: '/app'
	});

	const trail = $derived(
		buildExplicitBreadcrumb(
			kind === 'document'
				? [
						{ label: 'Documents', iconKey: 'documents' },
						{ label: 'Authoring', href: '/app/documents' },
						{ label: 'Quality Assurance', href: '/app/documents/department/3' },
						{ label: 'sops', href: '/app/documents/folder/5' },
						{ label: 'Method transfer protocol, HPLC assay', namedByHeader: true }
					]
				: [
						{ label: 'Work', iconKey: 'work' },
						{ label: 'Records', href: '/app/work/records' },
						{ label: 'CCF-0001', namedByHeader: true }
					]
		)
	);
</script>

<Header {trail} />
