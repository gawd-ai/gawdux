/**
 * SSR-safe browser detection
 * Works in both SvelteKit and plain Svelte environments
 */
export declare const isBrowser: boolean;
/**
 * Safe localStorage getter
 */
export declare function getStorageItem(key: string): string | null;
/**
 * Safe localStorage setter
 */
export declare function setStorageItem(key: string, value: string): void;
/**
 * Safe localStorage remover
 */
export declare function removeStorageItem(key: string): void;
