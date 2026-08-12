import type { Snippet } from 'svelte';
type $$ComponentProps = {
    open?: boolean;
    labelledBy?: string | undefined;
    describedBy?: string | undefined;
    busy?: boolean;
    autoFocusSelector?: string;
    maxHeight?: string;
    variant?: 'attached' | 'card';
    dismissible?: boolean;
    class?: string;
    onclose?: (() => void) | undefined;
    children: Snippet;
    [key: string]: unknown;
};
declare const CommandDrawer: import("svelte").Component<$$ComponentProps, {}, "">;
type CommandDrawer = ReturnType<typeof CommandDrawer>;
export default CommandDrawer;
