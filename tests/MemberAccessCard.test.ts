import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MemberAccessCard from '../src/lib/admin/MemberAccessCard.svelte';
import SecurityActivityList from '../src/lib/admin/SecurityActivityList.svelte';

afterEach(() => cleanup());

const ROLES = [
	{ id: 1, name: 'Members', description: 'Baseline read access' },
	{ id: 9, name: 'Platform', system: true }
];

describe('MemberAccessCard', () => {
	it('is read-only unless the host grants editing AND handles it', () => {
		render(MemberAccessCard, { props: { roles: ROLES, candidates: [{ id: 2, name: 'Operators' }], canEdit: true } });
		expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();
	});

	it('never offers to remove a platform-managed Role', () => {
		render(MemberAccessCard, {
			props: { roles: ROLES, canEdit: true, onremove: () => {} }
		});
		expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(1);
	});

	it('raises the Role the host is asked to remove', async () => {
		const onremove = vi.fn();
		render(MemberAccessCard, { props: { roles: ROLES, canEdit: true, onremove } });
		await fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
		expect(onremove).toHaveBeenCalledWith(1);
	});

	it('shows a note instead of the list when the host gives one', () => {
		render(MemberAccessCard, {
			props: {
				roles: [],
				capabilityGroups: [{ id: 'devices', label: 'Devices', capabilities: [{ id: 'device:view', label: 'View devices' }] }],
				capabilityNote: 'Administrators can do everything in this tenant.'
			}
		});
		expect(screen.getByText('Administrators can do everything in this tenant.')).toBeTruthy();
		expect(screen.queryByText('View devices')).toBeNull();
	});
});

describe('SecurityActivityList', () => {
	it('renders rows through the host formatter, and an empty state', () => {
		const { unmount } = render(SecurityActivityList, {
			props: {
				events: [{ id: 'e1', at: '2026-09-23T10:00:00Z', label: 'Signed in', result: 'Succeeded', tone: 'success' }],
				formatTime: () => 'formatted'
			}
		});
		expect(screen.getByText('formatted')).toBeTruthy();
		expect(screen.getByText('Signed in')).toBeTruthy();
		unmount();
		render(SecurityActivityList, { props: { events: [] } });
		expect(screen.getByText('No sign-in activity recorded.')).toBeTruthy();
	});
});
