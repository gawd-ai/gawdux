import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RowLinkTable from './fixtures/RowLinkTable.svelte';

afterEach(cleanup);

describe('row link with a wrapped native table row', () => {
	it('forwards a background click once to the host router', async () => {
		const navigate = vi.fn();
		const open = vi.fn();
		const view = render(RowLinkTable, { navigate, open });
		await fireEvent.click(view.getByText('Row background'));
		expect(navigate).toHaveBeenCalledExactlyOnceWith('#item-7');
		expect(open).not.toHaveBeenCalled();
	});

	it('forwards middle and modified background clicks without using the router', async () => {
		const navigate = vi.fn();
		const open = vi.fn();
		const view = render(RowLinkTable, { navigate, open });
		const cell = view.getByText('Row background');
		await fireEvent(cell, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
		await fireEvent.click(cell, { ctrlKey: true });
		expect(open).toHaveBeenCalledTimes(2);
		expect(navigate).not.toHaveBeenCalled();
	});

	it('retains the native anchor and nested button without routing twice', async () => {
		const navigate = vi.fn();
		const open = vi.fn();
		const view = render(RowLinkTable, { navigate, open });
		expect(view.getByRole('link', { name: 'Item 7' }).getAttribute('href')).toBe('#item-7');
		await fireEvent.click(view.getByRole('link', { name: 'Item 7' }));
		await fireEvent.click(view.getByRole('button', { name: 'Action' }));
		expect(navigate).not.toHaveBeenCalled();
		expect(open).not.toHaveBeenCalled();
	});
});
