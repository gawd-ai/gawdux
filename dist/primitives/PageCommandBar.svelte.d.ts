import type { Snippet } from 'svelte';
import { type PageTabScope } from './page-chrome';
type $$ComponentProps = {
    children?: Snippet;
    /**
     * The tab, or tabs, whose acts these are: they show only while one of
     * them is the page's open tab (PAGE_TAB_CONTEXT), so a tab with no act
     * draws no bar. None: the page's, on every tab.
     */
    tab?: PageTabScope;
};
declare const PageCommandBar: import("svelte").Component<$$ComponentProps, {}, "">;
type PageCommandBar = ReturnType<typeof PageCommandBar>;
export default PageCommandBar;
