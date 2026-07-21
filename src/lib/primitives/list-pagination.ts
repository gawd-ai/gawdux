export interface ExactListPagination {
	mode?: 'exact';
	total: number;
	currentPage: number;
	totalPages: number;
	pageSize?: number;
	onPage: (page: number) => void;
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
