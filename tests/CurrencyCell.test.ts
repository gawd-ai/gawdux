import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import CurrencyCell from '../src/lib/primitives/CurrencyCell.svelte';

afterEach(() => cleanup());

const expected = (value: number, locale = 'en-CA', currency = 'CAD') =>
	new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

describe('CurrencyCell', () => {
	it('formats numeric values with the default locale and currency', () => {
		const { container } = render(CurrencyCell, { props: { value: 1234.5 } });
		expect(container.querySelector('span')?.textContent).toBe(expected(1234.5));
	});

	it('coerces string values before formatting', () => {
		const { container } = render(CurrencyCell, { props: { value: '99.99' } });
		expect(container.querySelector('span')?.textContent).toBe(expected(99.99));
	});

	it('honors explicit locale and currency', () => {
		const { container } = render(CurrencyCell, {
			props: { value: 10, currency: 'USD', locale: 'en-US' }
		});
		expect(container.querySelector('span')?.textContent).toBe(expected(10, 'en-US', 'USD'));
	});

	it('renders an empty cell for unparseable input', () => {
		const { container } = render(CurrencyCell, { props: { value: 'not-a-number' } });
		expect(container.querySelector('span')?.textContent).toBe('');
	});
});
