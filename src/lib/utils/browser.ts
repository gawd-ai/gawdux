/**
 * SSR-safe browser detection
 * Works in both SvelteKit and plain Svelte environments
 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Safe localStorage getter
 */
export function getStorageItem(key: string): string | null {
	if (!isBrowser) return null;
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

/**
 * Safe localStorage setter
 */
export function setStorageItem(key: string, value: string): void {
	if (!isBrowser) return;
	try {
		localStorage.setItem(key, value);
	} catch {
		// Storage may be unavailable (private browsing, quota exceeded, etc.)
	}
}

/**
 * Safe localStorage remover
 */
export function removeStorageItem(key: string): void {
	if (!isBrowser) return;
	try {
		localStorage.removeItem(key);
	} catch {
		// Ignore errors
	}
}
