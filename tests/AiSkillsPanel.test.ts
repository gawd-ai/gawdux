import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiSkillsPanel } from '../src/lib/admin/index';
import type {
	AiSkillDefinition,
	AiSkillGrant,
	AiSkillSettings,
	AiSkillsPanelActions,
	AiSkillsPanelModel
} from '../src/lib/admin/index';
import Host from './fixtures/AiSkillsPanelHost.svelte';

afterEach(cleanup);

const skill: AiSkillDefinition = {
	id: 'guide',
	name: 'Guide',
	tagline: 'Find the right operational guidance',
	category: 'operations',
	version: 'v2',
	instructionPack: 'Host template {{param:scope}}',
	requires: ['foundation'],
	parameters: [
		{
			key: 'scope',
			label: 'Scope',
			description: 'Working scope',
			kind: 'text',
			required: true,
			maxChars: 24
		}
	],
	knowledgeSlots: [
		{ id: 'library', label: 'Library', description: 'Available references', required: true }
	],
	tools: [
		{ tool: 'lookup', purpose: 'Find references' },
		{ tool: 'archive', purpose: 'Retain results' }
	]
};
const other: AiSkillDefinition = {
	id: 'foundation',
	name: 'Foundation',
	tagline: 'Common operating practice',
	category: 'general',
	version: 'v1',
	instructionPack: 'Foundation text'
};
function model(): AiSkillsPanelModel<string> {
	return {
		skillCatalog: [skill, other],
		botCatalog: [
			{ id: 'ops', name: 'Operations', role: 'Support', initials: 'OP', color: 'bg-blue-600' }
		],
		grants: [{ botId: 'ops', skillId: 'guide' }],
		selectedSkillId: 'guide',
		settings: { guide: { params: { scope: 'Saved' }, revision: 7 } },
		bindings: { guide: { library: 'kb-original' } },
		kbOptions: [
			{ id: 'kb-original', name: 'Original library' },
			{ id: 'kb-next', name: 'Next library' }
		],
		bridgeTools: [
			{ id: 'lookup', status: 'live' },
			{ id: 'archive', status: 'unavailable' }
		]
	};
}
function actions(): AiSkillsPanelActions<string> {
	return {
		navigate: vi.fn(async () => undefined),
		requestDiscard: vi.fn(),
		setGrant: vi.fn(async () => ({ grants: [] })),
		grantsChanged: vi.fn(),
		saveSettings: vi.fn(async ({ params, expectedRevision }) => ({
			params,
			revision: expectedRevision + 1
		})),
		loadSettings: vi.fn(async () => ({ params: { scope: 'Other writer' }, revision: 12 })),
		setKnowledgeBinding: vi.fn(async () => undefined),
		renderPreview: vi.fn((_definition, tuning, live) =>
			JSON.stringify({ tuning, live: [...live] })
		),
		classifyError: (error) =>
			error === 'stale' ? 'stale' : error === 'dependents' ? 'dependents' : 'other',
		errorMessage: (error, fallback) => (typeof error === 'string' ? error : fallback)
	};
}
function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<T>((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}
function state(container: HTMLElement) {
	return JSON.parse(container.querySelector('[data-panel-state]')!.textContent!) as {
		settingsDirty: boolean;
		editorBusy: boolean;
	};
}
function scope() {
	return screen.getByLabelText('Scope') as HTMLInputElement;
}
function toggle() {
	return screen.getByRole('checkbox', { name: 'Revoke Guide from Operations' }) as HTMLInputElement;
}
function row(id: string) {
	return [...document.querySelectorAll<HTMLButtonElement>('[data-master-detail-row]')].find(
		(item) => item.textContent?.includes(id)
	)!;
}

describe('shared Skills panel host contract', () => {
	it('preserves the rail/detail geometry, facet cards and authorized history slot', () => {
		const adapter = actions();
		const { container } = render(Host, { model: model(), actions: adapter, withHistory: true });
		expect(AiSkillsPanel).toBeDefined();
		expect(
			container
				.querySelector('.master-detail-card')
				?.classList.contains('@3xl:grid-cols-[18rem_minmax(0,1fr)]')
		).toBe(true);
		expect(container.querySelector('[data-guide-id="host-skills"]')).toBeTruthy();
		expect(row('Guide').getAttribute('aria-current')).toBe('true');
		expect(screen.getByText('Authorized host history')).toBeTruthy();
		expect(screen.getByText('Live')).toBeTruthy();
		expect(screen.getByText('Not available')).toBeTruthy();
		expect(scope().value).toBe('Saved');
		expect(state(container)).toEqual({ settingsDirty: false, editorBusy: false });
	});

	it('filters by name or tagline and leaves navigation/selection authoritative in the host', async () => {
		const adapter = actions();
		render(Host, { model: model(), actions: adapter });
		await fireEvent.input(screen.getByLabelText('Search skills'), { target: { value: 'common' } });
		expect(row('Guide')).toBeUndefined();
		await fireEvent.click(row('Foundation'));
		expect(adapter.navigate).toHaveBeenCalledWith('foundation');
		expect(scope().value).toBe('Saved');
		expect(adapter.requestDiscard).not.toHaveBeenCalled();
	});

	it('requests host discard before changing selection and supplies an accessible focus target', async () => {
		const adapter = actions();
		const { container } = render(Host, { model: model(), actions: adapter });
		await fireEvent.input(scope(), { target: { value: 'Local draft' } });
		expect(state(container).settingsDirty).toBe(true);
		await fireEvent.click(row('Foundation'));
		expect(adapter.navigate).not.toHaveBeenCalled();
		const request = vi.mocked(adapter.requestDiscard).mock.calls[0]![0];
		expect(request.confirmLabel).toBe('Discard and open skill');
		expect(request.focusAfter()?.getAttribute('aria-label')).toBe('Skill details');
		await request.continue();
		expect(adapter.navigate).toHaveBeenCalledWith('foundation');
	});

	it('retains same-selection drafts and their captured revision when loaded data refreshes', async () => {
		const adapter = actions();
		const loaded = model();
		const { rerender } = render(Host, { model: loaded, actions: adapter });
		await fireEvent.input(scope(), { target: { value: 'Local draft' } });
		await rerender({
			model: {
				...loaded,
				settings: { guide: { params: { scope: 'Server changed' }, revision: 99 } }
			},
			actions: adapter
		});
		expect(scope().value).toBe('Local draft');
		await fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
		expect(adapter.saveSettings).toHaveBeenCalledWith({
			skillId: 'guide',
			params: { scope: 'Local draft' },
			expectedRevision: 7
		});
	});

	it('passes the captured CAS revision, blocks selection while saving and adopts the returned revision', async () => {
		const adapter = actions();
		const save = deferred<AiSkillSettings>();
		vi.mocked(adapter.saveSettings).mockImplementationOnce(() => save.promise);
		const { container } = render(Host, { model: model(), actions: adapter });
		await fireEvent.input(scope(), { target: { value: 'First edit' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
		expect(row('Foundation').disabled).toBe(true);
		expect(state(container).editorBusy).toBe(true);
		expect(adapter.saveSettings).toHaveBeenCalledTimes(1);
		save.resolve({ params: { scope: 'First edit' }, revision: 8 });
		await waitFor(() =>
			expect(state(container)).toEqual({ settingsDirty: false, editorBusy: false })
		);
		await fireEvent.input(scope(), { target: { value: 'Second edit' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
		expect(adapter.saveSettings).toHaveBeenLastCalledWith({
			skillId: 'guide',
			params: { scope: 'Second edit' },
			expectedRevision: 8
		});
	});

	it('refuses stale retries until explicit reload discards the draft and updates the revision', async () => {
		const adapter = actions();
		vi.mocked(adapter.saveSettings).mockRejectedValueOnce('stale');
		const { container } = render(Host, { model: model(), actions: adapter });
		await fireEvent.input(scope(), { target: { value: 'Local draft' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
		await screen.findByText(/These settings were changed by someone else/);
		expect(
			(screen.getByRole('button', { name: 'Save settings' }) as HTMLButtonElement).disabled
		).toBe(true);
		expect(scope().value).toBe('Local draft');
		await fireEvent.click(screen.getByRole('button', { name: 'Reload settings' }));
		await waitFor(() => expect(scope().value).toBe('Other writer'));
		expect(state(container).settingsDirty).toBe(false);
		await fireEvent.input(scope(), { target: { value: 'After reload' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
		expect(adapter.saveSettings).toHaveBeenLastCalledWith({
			skillId: 'guide',
			params: { scope: 'After reload' },
			expectedRevision: 12
		});
	});

	it('discards locally without calling the host and does not turn required hints into new validation', async () => {
		const adapter = actions();
		const { container } = render(Host, { model: model(), actions: adapter });
		await fireEvent.input(scope(), { target: { value: '' } });
		expect(
			(screen.getByRole('button', { name: 'Save settings' }) as HTMLButtonElement).disabled
		).toBe(false);
		await fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
		expect(scope().value).toBe('Saved');
		expect(state(container).settingsDirty).toBe(false);
		expect(adapter.saveSettings).not.toHaveBeenCalled();
	});

	it('keeps reserved placeholder and maximum-length feedback local, with no invalid write', async () => {
		const adapter = actions();
		render(Host, { model: model(), actions: adapter });
		await fireEvent.input(scope(), { target: { value: '{{param:scope}}' } });
		expect(scope().getAttribute('aria-invalid')).toBe('true');
		expect(
			(screen.getByRole('button', { name: 'Save settings' }) as HTMLButtonElement).disabled
		).toBe(true);
		expect(screen.getByText(/placeholder syntax/)).toBeTruthy();
		await fireEvent.input(scope(), { target: { value: 'x'.repeat(25) } });
		expect(scope().getAttribute('aria-invalid')).toBe('true');
		expect(adapter.saveSettings).not.toHaveBeenCalled();
	});

	it('turns dependent refusal into inline cascade confirmation and accepts the full authoritative grant set', async () => {
		const adapter = actions();
		vi.mocked(adapter.setGrant).mockRejectedValueOnce('dependents');
		const authoritative: AiSkillGrant[] = [{ botId: 'ops', skillId: 'foundation' }];
		vi.mocked(adapter.setGrant).mockResolvedValueOnce({ grants: authoritative });
		render(Host, { model: model(), actions: adapter });
		await fireEvent.click(toggle());
		await screen.findByRole('button', { name: 'Turn off together' });
		expect(adapter.setGrant).toHaveBeenNthCalledWith(1, {
			botId: 'ops',
			skillId: 'guide',
			allowed: false,
			cascade: false
		});
		expect(toggle().checked).toBe(true);
		await fireEvent.click(screen.getByRole('button', { name: 'Turn off together' }));
		await waitFor(() => expect(adapter.grantsChanged).toHaveBeenLastCalledWith(authoritative));
		expect(adapter.setGrant).toHaveBeenNthCalledWith(2, {
			botId: 'ops',
			skillId: 'guide',
			allowed: false,
			cascade: true
		});
		expect(
			(screen.getByRole('checkbox', { name: 'Grant Guide to Operations' }) as HTMLInputElement)
				.checked
		).toBe(false);
	});

	it('blocks duplicate pending grant writes and leaves the previous set on failure', async () => {
		const adapter = actions();
		const grant = deferred<{ grants: AiSkillGrant[] }>();
		vi.mocked(adapter.setGrant).mockImplementation(() => grant.promise);
		const initial = model();
		const { container } = render(Host, { model: initial, actions: adapter });
		await fireEvent.click(toggle());
		expect(toggle().disabled).toBe(true);
		expect(row('Foundation').disabled).toBe(true);
		expect(state(container).editorBusy).toBe(true);
		grant.reject(new Error('network'));
		await screen.findByText('Could not save the grant.');
		expect(adapter.grantsChanged).toHaveBeenCalledWith(initial.grants);
		expect(toggle().checked).toBe(true);
		expect(adapter.setGrant).toHaveBeenCalledTimes(1);
	});

	it('binds opaque knowledge IDs without numeric coercion, previews optimistically and rolls back errors', async () => {
		const adapter = actions();
		const binding = deferred<void>();
		vi.mocked(adapter.setKnowledgeBinding).mockImplementation(() => binding.promise);
		const { container } = render(Host, { model: model(), actions: adapter });
		const select = screen.getByLabelText('Library knowledge base') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: 'kb-next' } });
		expect(select.value).toBe('kb-next');
		expect(select.disabled).toBe(true);
		expect(state(container).editorBusy).toBe(true);
		expect(adapter.setKnowledgeBinding).toHaveBeenCalledWith({
			skillId: 'guide',
			slotId: 'library',
			knowledgeId: 'kb-next'
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Preview with your settings' }));
		expect(screen.getByText(/Next library.*lookup/).tagName).toBe('PRE');
		binding.reject(new Error('denied'));
		await screen.findByText('Could not save the knowledge binding.');
		expect(select.value).toBe('kb-original');
		await fireEvent.change(select, { target: { value: '' } });
		expect(adapter.setKnowledgeBinding).toHaveBeenLastCalledWith({
			skillId: 'guide',
			slotId: 'library',
			knowledgeId: null
		});
	});

	it('renders only current KB names and explicitly live tool IDs through the host preview policy', async () => {
		const adapter = actions();
		const loaded = model();
		loaded.bindings = { guide: { library: 'removed' } };
		render(Host, { model: loaded, actions: adapter });
		await fireEvent.click(screen.getByRole('button', { name: 'Preview with your settings' }));
		expect(screen.getByText(/bound knowledge base no longer exists/)).toBeTruthy();
		expect(adapter.renderPreview).toHaveBeenLastCalledWith(
			skill,
			{ params: { scope: 'Saved' }, knowledge: {} },
			new Set(['lookup'])
		);
		expect(screen.queryByText(/Ships with/)).toBeNull();
	});

	it('reseeds only on selected-ID change and suppresses late error presentation for a different skill', async () => {
		const adapter = actions();
		const save = deferred<AiSkillSettings>();
		vi.mocked(adapter.saveSettings).mockImplementation(() => save.promise);
		const loaded = model();
		const { rerender } = render(Host, { model: loaded, actions: adapter });
		await fireEvent.input(scope(), { target: { value: 'Old draft' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
		await rerender({ model: { ...loaded, selectedSkillId: 'foundation' }, actions: adapter });
		save.reject('stale');
		await waitFor(() => expect(screen.queryByText(/These settings were changed/)).toBeNull());
		expect(screen.queryByLabelText('Scope')).toBeNull();
		expect(screen.getByText('Foundation text')).toBeTruthy();
	});

	it('does not render a pretend capability for an absent model', () => {
		const adapter = actions();
		const { container } = render(Host, { model: null, actions: adapter });
		expect(container.querySelector('.master-detail-shell')).toBeNull();
		expect(screen.queryByText('No skills match.')).toBeNull();
		expect(adapter.renderPreview).not.toHaveBeenCalled();
		expect(state(container)).toEqual({ settingsDirty: false, editorBusy: false });
	});
});
