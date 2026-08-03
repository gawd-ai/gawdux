import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import EmptyStateRow from '../src/lib/primitives/EmptyStateRow.svelte';

afterEach(() => cleanup());

describe('EmptyStateRow `hint` prop (additive merge)', () => {
	it('renders existing usage unchanged when no hint is given', () => {
		const { container } = render(EmptyStateRow, {
			props: { colspan: 3, text: 'No results found' }
		});

		const cell = container.querySelector('td');
		expect(cell?.getAttribute('colspan')).toBe('3');
		expect(screen.getByText('No results found')).toBeTruthy();
		// No second line appears for pre-existing call sites.
		expect(cell?.querySelectorAll('span')).toHaveLength(1);
	});

	it('renders the hint as a second muted line under the text', () => {
		const { container } = render(EmptyStateRow, {
			props: { colspan: 2, text: 'No devices yet', hint: 'Adjust the filters or add one' }
		});

		const spans = container.querySelectorAll('td span');
		expect(spans).toHaveLength(2);
		expect(spans[0]?.textContent).toBe('No devices yet');
		expect(spans[1]?.textContent).toBe('Adjust the filters or add one');
		expect(spans[1]?.className).toContain('text-sm');
	});
});
