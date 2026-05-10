// gawdux/primitives — visually-opinionated low-level UI components
// (design system layer; consumer apps own app shell + Tailwind config).

export { default as BreadcrumbTrail } from './BreadcrumbTrail.svelte';
export { default as CardContainer } from './CardContainer.svelte';
export { default as ClearableInput } from './ClearableInput.svelte';
export { default as ConfirmModal } from './ConfirmModal.svelte';
export { default as DateCell } from './DateCell.svelte';
export { default as EditablePageScaffold } from './EditablePageScaffold.svelte';
export { default as EmptyStateRow } from './EmptyStateRow.svelte';
export { default as FilterBar } from './FilterBar.svelte';
export { default as FormField } from './FormField.svelte';
export { default as ListPageScaffold } from './ListPageScaffold.svelte';
export { default as ListPaginationCount } from './ListPaginationCount.svelte';
export { default as ListPaginationNav } from './ListPaginationNav.svelte';
export { default as ListSurface } from './ListSurface.svelte';
export { default as PageActionBar } from './PageActionBar.svelte';
export { default as PageCommandBar } from './PageCommandBar.svelte';
export { default as PageCommandBarCenter } from './PageCommandBarCenter.svelte';
export { default as PageCommandBarRight } from './PageCommandBarRight.svelte';
export { default as PageFeedback } from './PageFeedback.svelte';
export { default as PageTabs } from './PageTabs.svelte';
export { default as ReadonlyField } from './ReadonlyField.svelte';
export { default as ResizableSplitter } from './ResizableSplitter.svelte';
export { default as SortableHeadCell } from './SortableHeadCell.svelte';
export { default as TableContainer } from './TableContainer.svelte';
export { default as TabTitle } from './TabTitle.svelte';

export {
	PAGE_COMMAND_BAR_CONTEXT,
	EMPTY_PAGE_COMMAND_BAR_SLOTS
} from './page-chrome';
export type {
	AppBreadcrumbItem,
	AppBreadcrumbData,
	PageCommandBarZone,
	PageCommandBarSlots,
	PageCommandBarContext
} from './page-chrome';
export type {
	LifecycleAction,
	EditModeProps,
	LifecycleKindRenderers
} from './PageActionBar.svelte';
