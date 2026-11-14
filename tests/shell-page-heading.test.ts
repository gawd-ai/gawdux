import { describe, expect, it } from 'vitest';
import {
	APP_PAGE_HEADING_CONTEXT,
	createAppPageHeading
} from '../src/lib/shell/page-heading.svelte';

describe('the page heading a page sets after an in-place change', () => {
	it('renames the trail leaf and states the status, for its own address alone', () => {
		const heading = createAppPageHeading();
		const trail = [{ label: 'Projects', href: '/app/projects' }, { label: 'New project' }];
		heading.controller.set('/app/projects/7', 'Draft', 'P-0007');
		expect(heading.trail('/app/projects/7', trail).map((crumb) => crumb.label)).toEqual([
			'Projects',
			'P-0007'
		]);
		expect(heading.trail('/app/projects/7', trail)[0]).toBe(trail[0]);
		expect(heading.status('/app/projects/7', 'Open')).toBe('Draft');
		expect(heading.label('/app/projects/7')).toBe('P-0007');
		// Another page never shows it.
		expect(heading.trail('/app/projects/8', trail)).toBe(trail);
		expect(heading.status('/app/projects/8', 'Open')).toBe('Open');
		expect(heading.status('/app/projects/8')).toBeNull();
		expect(heading.label('/app/projects/8')).toBeUndefined();
	});

	it('keeps the stated name when a page sets a status alone', () => {
		const heading = createAppPageHeading();
		const trail = [{ label: 'Records' }, { label: 'R-1' }];
		heading.controller.set('/app/records/1', 'Signed');
		expect(heading.trail('/app/records/1', trail)).toBe(trail);
		expect(heading.status('/app/records/1')).toBe('Signed');
		expect(heading.trail('/app/records/1', [])).toEqual([]);
	});

	it('clears only for the page that set it', () => {
		const heading = createAppPageHeading();
		heading.controller.set('/app/records/1', 'Signed', 'R-1');
		heading.controller.clear('/app/records/2');
		expect(heading.status('/app/records/1')).toBe('Signed');
		heading.controller.clear('/app/records/1');
		expect(heading.status('/app/records/1', null)).toBeNull();
		expect(heading.label('/app/records/1')).toBeUndefined();
	});

	it('is found under one context key', () => {
		expect(typeof APP_PAGE_HEADING_CONTEXT).toBe('symbol');
	});
});
