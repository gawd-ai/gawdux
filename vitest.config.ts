import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	resolve: {
		conditions: ['svelte', 'browser'],
		alias: {
			// The plain svelte plugin (no SvelteKit) cannot resolve $app/*;
			// library modules importing $app/navigation get a no-op stub.
			'$app/navigation': new URL('./tests/stubs/app-navigation.ts', import.meta.url).pathname
		}
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{ts,js}', 'tests/**/*.{test,spec}.{ts,js}'],
		setupFiles: ['./tests/setup.ts'],
		// Vitest stubs CSS modules to empty strings — including `?raw` imports.
		// Process only tokens.css (its structural test reads the source);
		// everything else stays stubbed so component tests keep jsdom's
		// style-free visibility semantics.
		css: { include: [/tokens\.css/] },
		globals: false
	}
});
