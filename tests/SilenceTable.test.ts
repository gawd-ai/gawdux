import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import SilenceTable from '../src/lib/alert-ops/SilenceTable.svelte';
import { makeSilence } from './fixtures/alert-ops';

afterEach(() => cleanup());

describe('SilenceTable', () => {
	it('is strictly read-only: zero interactive controls in the rendered table', () => {
		const { container } = render(SilenceTable, {
			props: { silences: [makeSilence(), makeSilence({ id: 'silence-2', state: 'expired' })] }
		});
		expect(container.querySelectorAll('button, a, input, select, textarea')).toHaveLength(0);
	});

	it('renders matchers as name=value with regex matchers marked', () => {
		render(SilenceTable, {
			props: {
				silences: [
					makeSilence({
						matchers: [
							{ name: 'service', value: 'api-.*', isRegex: true },
							{ name: 'env', value: 'prod', isRegex: false }
						]
					})
				]
			}
		});
		expect(screen.getByText('service=~api-.*')).toBeTruthy();
		expect(screen.getByText('env=prod')).toBeTruthy();
		expect(screen.getByText('regex')).toBeTruthy();
	});

	it('renders state badge, window, creator and comment per silence', () => {
		render(SilenceTable, { props: { silences: [makeSilence()] } });
		const row = screen.getByTestId('silence-row');
		expect(row.textContent).toContain('Active');
		expect(row.textContent).toContain('ops@example.test');
		expect(row.textContent).toContain('Planned maintenance window');
		expect(row.querySelectorAll('time')).toHaveLength(2);
		// Cells carry the responsive card labels.
		for (const cell of row.querySelectorAll('td')) {
			expect(cell.getAttribute('data-label')).toBeTruthy();
		}
	});

	it('renders the empty message without controls when no silences exist', () => {
		const { container } = render(SilenceTable, { props: { silences: [] } });
		expect(screen.getByText('No silences')).toBeTruthy();
		expect(container.querySelectorAll('button, a')).toHaveLength(0);
	});
});
