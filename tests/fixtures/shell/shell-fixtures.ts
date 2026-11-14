// Shared props of the shell fixtures: one person, one trail, one rail.
import { ChevronRightOutline, ClipboardListOutline, FolderOutline } from 'flowbite-svelte-icons';
import type { SidebarConfig } from '../../../src/lib/types/sidebar.types';
import type { PageCrumb } from '../../../src/lib/shell/app-trail';

export const RECORD_TRAIL: PageCrumb[] = [
	{ label: 'Audit', href: '/app/audit', icon: ClipboardListOutline },
	{ label: 'Reviews', href: '/app/reviews', icon: ChevronRightOutline },
	{ label: 'Change controls', href: '/app/reviews/folder/5', icon: ChevronRightOutline },
	{
		label: 'CC-0003 · Review deployment gate-shots and the evidence',
		icon: ChevronRightOutline
	}
];

export const PERSON = {
	initials: 'QA',
	name: 'Quinn Adler',
	email: 'quinn@example.test',
	roleLabels: ['Quality'],
	accessLabel: 'Member',
	profileHref: '/app/profile',
	signOutAction: '/signoff',
	product: 'Example',
	versionLabel: '1.0',
	versionTooltip: 'Reviewed build'
};

export const RAIL: SidebarConfig = {
	rootItems: [{ id: 'documents', label: 'Documents', href: '/app/documents', icon: FolderOutline }],
	groups: [],
	showToggleAll: false
} as unknown as SidebarConfig;
