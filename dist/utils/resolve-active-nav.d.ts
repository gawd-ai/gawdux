import type { SidebarConfig } from '../types/sidebar.types.js';
/**
 * Map the current URL to the longest-prefix-matching nav item href so detail
 * pages keep their parent list highlighted (`/products/123` stays on
 * `/products`). Plain prefix matching would over-match — `/products` must
 * not light up when on `/products-archive` — so we require either equality
 * or a `/` boundary.
 */
export declare function resolveActiveItemHref(activeUrl: string, config: SidebarConfig | null | undefined): string | null;
