import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiKnowledgePanel } from '../src/lib/admin/index';
import type {
	AiKnowledgeBase,
	AiKnowledgePanelActions,
	AiKnowledgePanelModel,
	AiKnowledgeResource,
	AiKnowledgeSource
} from '../src/lib/admin/index';
import Host from './fixtures/AiKnowledgePanelHost.svelte';

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

interface HostKnowledge extends AiKnowledgeBase<string> {
	hostMetadata: string;
}
const base: HostKnowledge = {
	id: 'library-a',
	name: 'Library',
	description: 'Saved description',
	hostMetadata: 'Retained host field',
	rollup: {
		sourceCount: 1,
		readyCount: 1,
		ingestingCount: 0,
		errorCount: 0,
		staleCount: 0,
		unavailableCount: 0,
		charCount: 80
	}
};
const source: AiKnowledgeSource<string> = {
	id: 'source-a',
	kind: 'resource',
	title: 'Reference',
	status: { label: 'Ready', tone: 'ready' },
	chunkCount: 1,
	charCount: 80,
	metadata: [{ label: 'Host-selected edition' }],
	canRefresh: true,
	refreshTitle: 'Refresh eligible reference'
};
function model(): AiKnowledgePanelModel<string, string, HostKnowledge> {
	return {
		knowledgeBases: [base, { ...base, id: 'library-b', name: 'Other library' }],
		selectedKnowledgeId: base.id,
		sources: [source],
		limits: {
			maxKnowledgeBases: 4,
			maxSourcesPerBase: 5,
			maxCharsPerBase: 1000,
			nameMaxChars: 40,
			descriptionMaxChars: 200
		},
		sourcePolicy: {
			addLabel: 'Add reference',
			searchLabel: 'Search eligible references',
			emptySearch: 'No eligible references match.',
			disclosure: 'Host-reviewed resource disclosure.',
			emptySources: 'No authorized sources.',
			uploadLabel: 'Host-supported text file',
			uploadAccept: '.txt',
			availability: 'Search is available for authorized agents.',
			namePlaceholder: 'Reference library',
			emptyDetail: 'A host library holds reference content.',
			searchErrorMessage: 'References unavailable.',
			addErrorMessage: 'Could not add reference.'
		},
		usage: {
			entries: [
				{
					id: 'use-a',
					label: 'Guidance',
					detail: 'Library slot',
					href: '/host/skills/guide'
				}
			],
			connect: null,
			emptyMessage: 'No connected capabilities.',
			blockedMessage: 'Disconnect the host usage before deleting.',
			deleteBlockedReason: 'Host usage prevents deletion.',
			discardMessage: 'Discard and open the host capability?',
			discardConfirmLabel: 'Discard and open guidance'
		}
	};
}
function actions(): AiKnowledgePanelActions<string, string, string, HostKnowledge> {
	return {
		navigate: vi.fn(async () => undefined),
		navigateUsage: vi.fn(async () => undefined),
		usageFocusTarget: vi.fn(() => null),
		requestDiscard: vi.fn(),
		knowledgeBasesChanged: vi.fn(),
		create: vi.fn(async (input) => ({ ...base, ...input, id: 'library-new' })),
		update: vi.fn(async (id, input) => ({ ...base, ...input, id })),
		delete: vi.fn(async () => undefined),
		refreshKnowledgeBases: vi.fn(async () => undefined),
		searchResources: vi.fn(async () => [
			{
				id: 'resource-a',
				title: 'Available reference',
				metadata: 'Host metadata'
			}
		]),
		addResource: vi.fn(async () => ({
			...source,
			id: 'source-new',
			title: 'New reference'
		})),
		upload: vi.fn(
			async (): Promise<AiKnowledgeSource<string>> => ({
				...source,
				id: 'upload-new',
				kind: 'upload'
			})
		),
		refreshSource: vi.fn(
			async (): Promise<AiKnowledgeSource<string>> => ({
				...source,
				status: { label: 'Host refreshed', tone: 'ready' }
			})
		),
		removeSource: vi.fn(async () => undefined),
		validateUpload: vi.fn(() => null),
		isAbortError: (error) => error instanceof DOMException && error.name === 'AbortError',
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
		editorDirty: boolean;
		editorBusy: boolean;
	};
}
function railRow(name: string) {
	return [...document.querySelectorAll<HTMLButtonElement>('[data-master-detail-row]')].find((row) =>
		row.textContent?.includes(name)
	)!;
}

describe('shared Knowledge host contract', () => {
	it('uses the existing geometry, complete host presentation, and authorized history slot', () => {
		const { container } = render(Host, {
			model: model(),
			actions: actions(),
			withHistory: true
		});
		expect(AiKnowledgePanel).toBeDefined();
		expect(
			container
				.querySelector('.master-detail-card')
				?.classList.contains('@3xl:grid-cols-[18rem_minmax(0,1fr)]')
		).toBe(true);
		expect(container.querySelector('[data-guide-id="host-knowledge"]')).toBeTruthy();
		expect(screen.getByText('Authorized host history')).toBeTruthy();
		expect(screen.getByText('Host-selected edition')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Re-ingest Reference' }).getAttribute('title')).toBe(
			'Refresh eligible reference'
		);
		expect(
			(
				screen.getByRole('button', {
					name: 'Delete knowledge base'
				}) as HTMLButtonElement
			).disabled
		).toBe(true);
		expect(state(container)).toEqual({ editorDirty: false, editorBusy: false });
	});
	it('renders no substitute capability or effects when the model or optional usage is absent', async () => {
		const adapter = actions();
		const { rerender } = render(Host, { model: null, actions: adapter });
		expect(screen.queryByLabelText('Search knowledge bases')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Host create' }));
		expect(adapter.create).not.toHaveBeenCalled();
		await rerender({ model: { ...model(), usage: null }, actions: adapter });
		expect(screen.queryByText('Used by')).toBeNull();
		expect(screen.queryByText('History')).toBeNull();
		expect(
			(
				screen.getByRole('button', {
					name: 'Delete knowledge base'
				}) as HTMLButtonElement
			).disabled
		).toBe(false);
	});
	it('filters the rail without changing selection and asks the host to approve dirty navigation', async () => {
		const adapter = actions();
		const { container } = render(Host, { model: model(), actions: adapter });
		await fireEvent.input(screen.getByLabelText('Name'), {
			target: { value: 'Unsaved name' }
		});
		await fireEvent.input(screen.getByLabelText('Search knowledge bases'), {
			target: { value: 'Other' }
		});
		expect(railRow('Library')).toBeUndefined();
		expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Unsaved name');
		await fireEvent.click(railRow('Other library'));
		const request = vi.mocked(adapter.requestDiscard).mock.calls[0]![0];
		expect(request.focusAfter()?.getAttribute('aria-label')).toBe('Knowledge base details');
		expect(state(container).editorDirty).toBe(true);
		expect(adapter.navigate).not.toHaveBeenCalled();
		await request.continue();
		expect(adapter.navigate).toHaveBeenCalledWith('library-b');
	});
	it('retains a same-selection draft and full opaque host rows through an authoritative update', async () => {
		const adapter = actions();
		const loaded = model();
		const { rerender } = render(Host, { model: loaded, actions: adapter });
		await fireEvent.input(screen.getByLabelText('Name'), {
			target: { value: 'Working name' }
		});
		await rerender({
			model: {
				...loaded,
				knowledgeBases: [{ ...base, name: 'Another operator' }]
			},
			actions: adapter
		});
		expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Working name');
		await fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		expect(adapter.update).toHaveBeenCalledWith('library-a', {
			name: 'Working name',
			description: 'Saved description'
		});
		expect(vi.mocked(adapter.knowledgeBasesChanged).mock.calls[0]![0][0]!.hostMetadata).toBe(
			'Retained host field'
		);
		expect(adapter.refreshKnowledgeBases).toHaveBeenCalledOnce();
	});
	it('keeps a pending write busy and applies source response before refreshing', async () => {
		const adapter = actions();
		const write = deferred<AiKnowledgeSource<string>>();
		vi.mocked(adapter.refreshSource).mockReturnValue(write.promise);
		vi.mocked(adapter.refreshKnowledgeBases).mockImplementation(async () => {
			expect(screen.getByText('Host refreshed')).toBeTruthy();
		});
		const { container, rerender } = render(Host, {
			model: model(),
			actions: adapter
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Re-ingest Reference' }));
		expect(state(container).editorBusy).toBe(true);
		expect(railRow('Other library').disabled).toBe(true);
		write.resolve({
			...source,
			status: { label: 'Host refreshed', tone: 'ready' }
		});
		await waitFor(() => expect(state(container).editorBusy).toBe(false));
		const current = model();
		const sameSources = current.sources;
		await rerender({
			model: { ...current, sources: sameSources },
			actions: adapter
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Re-ingest Reference' }));
		await waitFor(() => expect(screen.getByText('Host refreshed')).toBeTruthy());
		await rerender({
			model: {
				...current,
				sources: sameSources,
				knowledgeBases: [{ ...base, description: 'Refreshed rollup' }]
			},
			actions: adapter
		});
		expect(screen.getByText('Host refreshed')).toBeTruthy();
	});
	it('cancels and ignores stale search results, then uses opaque resource IDs unchanged', async () => {
		const adapter = actions();
		const first = deferred<AiKnowledgeResource<string>[]>();
		vi.mocked(adapter.searchResources).mockReturnValueOnce(first.promise);
		render(Host, { model: model(), actions: adapter });
		await fireEvent.click(screen.getByRole('button', { name: 'Add reference' }));
		const signal = vi.mocked(adapter.searchResources).mock.calls[0]![0].signal;
		await fireEvent.input(screen.getByLabelText('Search eligible references'), {
			target: { value: 'next' }
		});
		expect(signal.aborted).toBe(true);
		await waitFor(() => expect(adapter.searchResources).toHaveBeenCalledTimes(2));
		first.resolve([{ id: 'stale', title: 'Stale result', metadata: '' }]);
		await waitFor(() => expect(screen.getByText('Available reference')).toBeTruthy());
		expect(screen.queryByText('Stale result')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Add' }));
		expect(adapter.addResource).toHaveBeenCalledWith('library-a', 'resource-a');
		await waitFor(() => expect(screen.getByText('New reference')).toBeTruthy());
	});
	it('aborts outstanding search on selection change and destruction without surfacing abort errors', async () => {
		const adapter = actions();
		const request = deferred<AiKnowledgeResource<string>[]>();
		vi.mocked(adapter.searchResources).mockReturnValue(request.promise);
		const loaded = model();
		const { rerender, unmount } = render(Host, {
			model: loaded,
			actions: adapter
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Add reference' }));
		const signal = vi.mocked(adapter.searchResources).mock.calls[0]![0].signal;
		await rerender({
			model: { ...loaded, selectedKnowledgeId: 'library-b', sources: [] },
			actions: adapter
		});
		expect(signal.aborted).toBe(true);
		request.reject(new DOMException('Aborted', 'AbortError'));
		await Promise.resolve();
		expect(screen.queryByRole('alert')).toBeNull();
		vi.mocked(adapter.searchResources).mockReturnValue(new Promise(() => {}));
		await fireEvent.click(screen.getByRole('button', { name: 'Add reference' }));
		const lastSignal = vi.mocked(adapter.searchResources).mock.calls.at(-1)![0].signal;
		unmount();
		expect(lastSignal.aborted).toBe(true);
	});
	it('keeps native modified/middle usage links and uses discard approval for ordinary navigation', async () => {
		const adapter = actions();
		const loaded = model();
		loaded.usage!.entries = [{ ...loaded.usage!.entries[0]!, href: '#guidance' }];
		render(Host, { model: loaded, actions: adapter });
		const link = screen.getByRole('link', { name: 'Guidance Library slot' });
		expect(link.getAttribute('href')).toBe('#guidance');
		expect(await fireEvent.click(link, { ctrlKey: true })).toBe(true);
		expect(await fireEvent.click(link, { button: 1 })).toBe(true);
		expect(adapter.navigateUsage).not.toHaveBeenCalled();
		await fireEvent.input(screen.getByLabelText('Name'), {
			target: { value: 'Unsaved' }
		});
		await fireEvent.click(link);
		const request = vi.mocked(adapter.requestDiscard).mock.calls[0]![0];
		expect(request.message).toBe('Discard and open the host capability?');
		await request.continue();
		expect(adapter.navigateUsage).toHaveBeenCalledWith(loaded.usage!.entries[0]);
	});
	it('confirms removals in place and preserves the authoritative source error', async () => {
		const adapter = actions();
		const remove = deferred<void>();
		vi.mocked(adapter.removeSource).mockReturnValue(remove.promise);
		const { container } = render(Host, { model: model(), actions: adapter });
		await fireEvent.click(
			screen.getByRole('button', {
				name: 'Remove Reference from this knowledge base'
			})
		);
		expect(adapter.removeSource).not.toHaveBeenCalled();
		expect(screen.queryByRole('dialog')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Remove source' }));
		expect(state(container).editorBusy).toBe(true);
		remove.reject('Host refused removal.');
		await waitFor(() =>
			expect(screen.getByRole('alert').textContent).toBe('Host refused removal.')
		);
		expect(screen.getByText('Reference')).toBeTruthy();
		expect(adapter.refreshKnowledgeBases).not.toHaveBeenCalled();
	});
	it('uses host upload acceptance/validation and blocks limits before invoking effects', async () => {
		const adapter = actions();
		vi.mocked(adapter.validateUpload).mockReturnValue('Host upload limit.');
		const { container, rerender } = render(Host, {
			model: model(),
			actions: adapter
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Upload file' }));
		const input = screen.getByLabelText('Host-supported text file');
		expect(input.getAttribute('accept')).toBe('.txt');
		const file = new File(['body'], 'reference.txt');
		await fireEvent.change(input, { target: { files: [file] } });
		expect(state(container).editorDirty).toBe(true);
		await fireEvent.click(screen.getByRole('button', { name: 'Upload and ingest' }));
		expect(adapter.validateUpload).toHaveBeenCalledWith(file);
		expect(adapter.upload).not.toHaveBeenCalled();
		expect(screen.getByRole('alert').textContent).toBe('Host upload limit.');
		await rerender({
			model: {
				...model(),
				limits: {
					...model().limits,
					maxSourcesPerBase: 1,
					maxKnowledgeBases: 2
				}
			},
			actions: adapter
		});
		expect(
			(
				screen.getByRole('button', {
					name: 'Add reference'
				}) as HTMLButtonElement
			).disabled
		).toBe(true);
		await fireEvent.click(screen.getByRole('button', { name: 'Host create' }));
		expect(screen.queryByRole('button', { name: 'Create knowledge base' })).toBeNull();
	});
	it('does not apply a late source response to a successor selection', async () => {
		const adapter = actions();
		const write = deferred<AiKnowledgeSource<string>>();
		vi.mocked(adapter.refreshSource).mockReturnValue(write.promise);
		const loaded = model();
		const { rerender } = render(Host, { model: loaded, actions: adapter });
		await fireEvent.click(screen.getByRole('button', { name: 'Re-ingest Reference' }));
		await rerender({
			model: { ...loaded, selectedKnowledgeId: 'library-b', sources: [] },
			actions: adapter
		});
		write.resolve({ ...source, title: 'Late source' });
		await waitFor(() => expect(adapter.refreshKnowledgeBases).toHaveBeenCalledOnce());
		expect(screen.queryByText('Late source')).toBeNull();
		expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Other library');
	});

	it('delegates command-bar creation and preserves full rows before host navigation', async () => {
		const adapter = actions();
		render(Host, { model: model(), actions: adapter });
		await fireEvent.click(screen.getByRole('button', { name: 'Host create' }));
		expect(screen.getByText('New knowledge base')).toBeTruthy();
		await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'New library' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Create knowledge base' }));
		expect(adapter.create).toHaveBeenCalledWith({ name: 'New library', description: '' });
		expect(vi.mocked(adapter.knowledgeBasesChanged).mock.calls[0]![0].at(-1)).toMatchObject({
			id: 'library-new',
			hostMetadata: 'Retained host field'
		});
		expect(adapter.navigate).toHaveBeenCalledWith('library-new');
		expect(adapter.refreshKnowledgeBases).not.toHaveBeenCalled();
	});

	it('requires an inline delete confirmation and navigates only after authoritative deletion', async () => {
		const adapter = actions();
		render(Host, { model: { ...model(), usage: null }, actions: adapter });
		await fireEvent.click(screen.getByRole('button', { name: 'Delete knowledge base' }));
		expect(adapter.delete).not.toHaveBeenCalled();
		expect(screen.queryByRole('dialog')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Delete knowledge base' }));
		expect(adapter.delete).toHaveBeenCalledWith('library-a');
		expect(vi.mocked(adapter.knowledgeBasesChanged).mock.calls[0]![0].map((kb) => kb.id)).toEqual([
			'library-b'
		]);
		expect(adapter.navigate).toHaveBeenCalledWith();
	});
});
