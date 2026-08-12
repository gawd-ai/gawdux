export interface ExactListPagination {
    mode?: 'exact';
    total: number;
    currentPage: number;
    totalPages: number;
    pageSize?: number;
    onPage: (page: number) => void;
    /**
     * Render numbered page buttons, so a reader can jump instead of stepping.
     * Mirrors `ListPaginationNav`'s own prop and defaults the same way (OFF).
     *
     * Without this the declarative path could not express what the imperative
     * one could, which made the two paths silently unequal: a consumer moving
     * a hand-wired `<ListPaginationNav showPageNumbers />` onto
     * `ListPageScaffold`'s `pagination` prop would LOSE its page numbers, with
     * no type error and nothing in the diff to suggest a capability had gone.
     * Cursor pagination has no page numbers to offer, so this lives here rather
     * than on the union.
     */
    showPageNumbers?: boolean;
}
export interface CursorListPagination {
    mode: 'cursor';
    visibleCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
}
export type ListPagination = ExactListPagination | CursorListPagination;
