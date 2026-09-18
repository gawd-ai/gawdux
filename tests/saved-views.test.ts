import { describe, expect, it } from 'vitest';
import {
	normalizeQuery,
	sameQuery,
	savedViewMatch,
	type SavedViewSummary
} from '../src/lib/primitives/saved-views';

const VIEWS: SavedViewSummary[] = [
	{ id: 'a', name: 'Offline', query: { status: 'offline' } },
	{ id: 'b', name: 'Offline again', query: { status: 'offline' } },
	{ id: 'c', name: 'Ford', query: { q: 'ford', sort: 'health' } }
];

describe('normalizeQuery', () => {
	it('drops empty and missing values and sorts the keys', () => {
		expect(Object.keys(normalizeQuery({ z: '1', a: '2', empty: '', gone: null }))).toEqual([
			'a',
			'z'
		]);
		expect(normalizeQuery(undefined)).toEqual({});
	});
});

describe('sameQuery', () => {
	it('ignores key order and empty values', () => {
		expect(sameQuery({ q: 'ford', sort: 'health' }, { sort: 'health', q: 'ford', x: '' })).toBe(
			true
		);
		expect(sameQuery({ q: 'ford' }, { q: 'ford', sort: 'health' })).toBe(false);
		expect(sameQuery({}, null)).toBe(true);
	});
});

describe('savedViewMatch', () => {
	it('reports the default query as All, not saveable', () => {
		expect(savedViewMatch({ q: '' }, VIEWS)).toEqual({
			activeId: null,
			isDefault: true,
			canSave: false
		});
	});

	it('offers to save an unsaved non-default query', () => {
		expect(savedViewMatch({ status: 'online' }, VIEWS)).toEqual({
			activeId: null,
			isDefault: false,
			canSave: true
		});
	});

	it('presses the matching view and hides the save control', () => {
		expect(savedViewMatch({ sort: 'health', q: 'ford' }, VIEWS)).toEqual({
			activeId: 'c',
			isDefault: false,
			canSave: false
		});
	});

	it('lets the first exact match win when two views share a query', () => {
		expect(savedViewMatch({ status: 'offline' }, VIEWS).activeId).toBe('a');
	});
});
