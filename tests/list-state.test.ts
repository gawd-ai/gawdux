import type { Page } from '@sveltejs/kit';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	initListState,
	listStateQuery,
	listStateValuesFrom,
	type ListStateConfig,
	type ListStateField
} from '../src/lib/utils/list-state';

const CONFIG = {
	key: 'test.list',
	fields: {
		q: { param: 'q', default: '' },
		status: { param: 'status', default: 'any' },
		sort: { param: 'sort', default: 'name' },
		page: { param: 'page', default: '1', ephemeral: true }
	}
} satisfies ListStateConfig & { fields: Record<string, ListStateField> };

function pageAt(search: string): Page {
	return { url: new URL(`http://localhost/app/list${search}`) } as unknown as Page;
}

beforeEach(() => {
	sessionStorage.clear();
});

describe('listStateQuery', () => {
	it('omits defaults, empty values and ephemeral fields', () => {
		expect(
			listStateQuery({ q: 'ford', status: 'any', sort: 'health', page: '3' }, CONFIG)
		).toEqual({ q: 'ford', sort: 'health' });
		expect(listStateQuery({ q: '', status: 'any', sort: 'name', page: '9' }, CONFIG)).toEqual({});
	});

	it('keys the projection by the URL param name, not the logical name', () => {
		const config = {
			key: 'k',
			fields: { search: { param: 'q', default: '' } }
		};
		expect(listStateQuery({ search: 'x' }, config)).toEqual({ q: 'x' });
	});
});

describe('listStateValuesFrom', () => {
	it('ignores unknown keys and fills missing ones with the default', () => {
		expect(listStateValuesFrom({ q: 'ford', bogus: 'ignored' }, CONFIG)).toEqual({
			q: 'ford',
			status: 'any',
			sort: 'name',
			page: '1'
		});
	});

	it('reads an empty value as the default', () => {
		expect(listStateValuesFrom({ status: '' }, CONFIG).status).toBe('any');
	});

	it('accepts URLSearchParams, including the ephemeral page number', () => {
		const values = listStateValuesFrom(new URLSearchParams('status=offline&page=4'), CONFIG);
		expect(values).toEqual({ q: '', status: 'offline', sort: 'name', page: '4' });
	});

	it('round trips through the projection', () => {
		const applied = { q: 'a b', status: 'online', sort: 'name', page: '2' };
		const restored = listStateValuesFrom(listStateQuery(applied, CONFIG), CONFIG);
		expect(restored).toEqual({ ...applied, page: '1' });
	});
});

describe('initListState', () => {
	it('resolves URL params through the same inverse, so an empty value is the default', () => {
		const state = initListState(pageAt('?q=&status=offline'), CONFIG, 'local:7');
		expect(state.values).toEqual({ q: '', status: 'offline', sort: 'name', page: '1' });
	});

	it('returns the projection bound to its own registry', () => {
		const state = initListState(pageAt(''), CONFIG, 'local:7');
		expect(state.query({ q: 'x', status: 'any', sort: 'name', page: '5' })).toEqual({ q: 'x' });
		expect(state.fromQuery({ q: 'x' })).toEqual({ q: 'x', status: 'any', sort: 'name', page: '1' });
		expect(state.fromQuery(new URLSearchParams('sort=health')).sort).toBe('health');
	});

	it('scopes storage by a string user id', () => {
		const state = initListState(pageAt('?status=offline'), CONFIG, 'local:42');
		state.persist({ q: '', status: 'offline', sort: 'name', page: '1' }, pageAt('?status=offline'));
		expect(sessionStorage.getItem('listState.local:42.test.list')).toContain('"status":"offline"');
		expect(document.cookie).toContain('ls.local:42.test.list=');
	});
});
