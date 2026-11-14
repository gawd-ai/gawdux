/**
 * A page's heading as the shell shows it after an in-place change: the
 * trail's leaf (`label`, the page's name) and the page's status, which the
 * page's own header draws (PAGE_STATUS_CONTEXT, PageTabs at the end of its
 * tab strip), never the trail. Keyed by the page's path, so a heading set on
 * one page never shows on another.
 */
export const APP_PAGE_HEADING_CONTEXT = Symbol('gawdux.app-page-heading');
/**
 * The shell's side of the page heading: it holds what a page set, hands the
 * page its controller and answers the trail and the status for the address
 * shown.
 */
export function createAppPageHeading() {
    let override = $state(null);
    const of = (pathname) => (override?.pathname === pathname ? override : null);
    return {
        controller: {
            set(pathname, status, label) {
                override = { pathname, status, ...(label === undefined ? {} : { label }) };
            },
            clear(pathname) {
                if (override?.pathname === pathname)
                    override = null;
            }
        },
        label: (pathname) => of(pathname)?.label,
        status: (pathname, stated = null) => of(pathname)?.status ?? stated ?? null,
        trail(pathname, items) {
            const label = of(pathname)?.label;
            if (label === undefined || items.length === 0)
                return items;
            return items.map((item, index) => (index === items.length - 1 ? { ...item, label } : item));
        }
    };
}
