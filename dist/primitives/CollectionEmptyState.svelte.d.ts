import type { Component } from 'svelte';
type CollectionEmptyStateProps = {
    title: string;
    message?: string | undefined;
    icon?: Component | undefined;
    variant?: 'empty' | 'no-results' | undefined;
    actionLabel?: string | undefined;
    actionHref?: string | undefined;
    onaction?: (() => void) | undefined;
    state?: string | undefined;
    className?: string | undefined;
};
declare const CollectionEmptyState: Component<CollectionEmptyStateProps, {}, "">;
type CollectionEmptyState = ReturnType<typeof CollectionEmptyState>;
export default CollectionEmptyState;
