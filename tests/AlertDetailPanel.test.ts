import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import AlertDetailPanel from '../src/lib/alert-ops/AlertDetailPanel.svelte';
import { makeAlert } from './fixtures/alert-ops';

afterEach(() => cleanup());

describe('AlertDetailPanel', () => {
	it('escapes hostile label and annotation values — markup renders as text, never as elements', () => {
		const hostile = makeAlert({
			labels: { '<script>alert(1)</script>': '<img src=x onerror="alert(1)">' },
			annotations: { note: '<b>not bold</b>' }
		});
		const { container } = render(AlertDetailPanel, { props: { alert: hostile } });

		expect(container.querySelector('script')).toBeNull();
		expect(container.querySelector('img')).toBeNull();
		expect(container.querySelector('b')).toBeNull();
		expect(screen.getByText('<script>alert(1)</script>')).toBeTruthy();
		expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeTruthy();
		expect(screen.getByText('<b>not bold</b>')).toBeTruthy();
	});

	it('renders safe links as hardened anchors and unsafe links inert without an href', () => {
		const alert = makeAlert({
			links: [
				{ href: 'https://runbooks.example.test/db-pool', label: 'Runbook', safe: true },
				{ href: 'javascript:alert(1)', label: 'Suspicious source', safe: false }
			]
		});
		const { container } = render(AlertDetailPanel, { props: { alert } });

		const anchors = container.querySelectorAll('a');
		expect(anchors).toHaveLength(1);
		expect(anchors[0]!.getAttribute('href')).toBe('https://runbooks.example.test/db-pool');
		expect(anchors[0]!.getAttribute('target')).toBe('_blank');
		expect(anchors[0]!.getAttribute('rel')).toBe('noopener noreferrer');

		const blocked = screen.getByTestId('alert-ops-blocked-link');
		expect(blocked.tagName).toBe('SPAN');
		expect(blocked.getAttribute('title')).toBe('Blocked link');
		expect(blocked.hasAttribute('href')).toBe(false);
		// The unsafe target never reaches the DOM in any attribute.
		expect(container.innerHTML).not.toContain('javascript:alert');
	});

	it('shows correlation identity: full fingerprint and group key', () => {
		render(AlertDetailPanel, {
			props: { alert: makeAlert(), groupKey: '{service="api"}' }
		});
		expect(screen.getByTestId('alert-detail-fingerprint').textContent?.trim()).toBe(
			'abcdef0123456789'
		);
		expect(screen.getByTestId('alert-detail-group-key').textContent?.trim()).toBe(
			'{service="api"}'
		);
	});

	it('renders the no-selection message without an alert', () => {
		render(AlertDetailPanel, { props: { alert: null } });
		expect(screen.getByTestId('alert-detail-empty').textContent).toContain(
			'Select an alert to see its details.'
		);
	});
});
