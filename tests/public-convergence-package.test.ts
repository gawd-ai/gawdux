import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { UserMenu } from 'gawdux';
import {
	DiscardNavigationCommandSurface,
	ConfirmationCommandSurface
} from 'gawdux/primitives';
import { publicUtilitiesFixture } from './fixtures/public-convergence';

const require = createRequire(import.meta.url);
const packageRoot = dirname(dirname(require.resolve('gawdux')));
afterEach(() => {
	document.body.innerHTML = '';
});

describe('compiled public convergence package', () => {
	it('resolves real exported distribution entries, not private source paths', () => {
		for (const [specifier, entry] of [
			['gawdux', 'index.js'],
			['gawdux/utils', 'utils/index.js'],
			['gawdux/primitives', 'primitives/index.js'],
			['gawdux/types', 'types/index.js']
		])
			expect(require.resolve(specifier)).toBe(join(packageRoot, 'dist', entry));
		expect(UserMenu).toBeDefined();
		expect(DiscardNavigationCommandSurface).toBeDefined();
		expect(ConfirmationCommandSurface).toBeDefined();
	});

	it('compiles strict uncast utility and presentation consumers against emitted declarations', () => {
		execFileSync(
			process.execPath,
			[
				require.resolve('typescript/bin/tsc'),
				'--noEmit',
				'--strict',
				'--exactOptionalPropertyTypes',
				'--skipLibCheck',
				'--target',
				'ES2022',
				'--module',
				'ESNext',
				'--moduleResolution',
				'bundler',
				'--lib',
				'ES2022,DOM,DOM.Iterable',
				'tests/fixtures/public-convergence.ts'
			],
			{ cwd: packageRoot, encoding: 'utf8', stdio: 'pipe' }
		);
	});

	it('executes emitted utility exports without host data, services or alternate implementations', async () => {
		const root = document.createElement('section');
		const trigger = document.createElement('button');
		root.append(trigger);
		document.body.append(root);
		const fixture = publicUtilitiesFixture(root, trigger, document, window);
		expect(fixture.days.map((row) => row.day)).toEqual([
			'2026-10-15',
			'2026-10-16'
		]);
		expect(fixture.days[1]?.recorded?.count).toBe(7);
		expect(fixture.ticks).toHaveLength(2);
		expect(fixture.calendar).toBe('2026-10-16');
		expect(fixture.today).toBe('2026-10-16');
		expect(fixture.audit).toEqual({
			date: '2026-10-16',
			time: '12:00:00',
			zone: 'UTC'
		});
		const unbind = fixture.bind();
		fixture.disclosure.toggle();
		fixture.disclosure.close();
		unbind();
		const unscope = fixture.scope();
		expect(document.activeElement).toBe(trigger);
		unscope();
		expect(fixture.transitionIn().duration).toBe(0);
		expect(fixture.transitionOut().duration).toBe(0);
		expect(await fixture.saved.save('Active')).toBe(true);
		expect(fixture.views()).toEqual([
			{
				id: 'view-1',
				name: 'Active',
				pageKey: 'records',
				query: { q: 'active' },
				revision: 1
			}
		]);
	});
});
