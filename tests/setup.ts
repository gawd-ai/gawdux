// Shared jsdom polyfills for the component suites.
//
// - `window.matchMedia`: svelte/motion instantiates a MediaQuery at module
//   scope (prefers-reduced-motion), so importing the flowbite-svelte barrel
//   requires matchMedia before any test hook runs. Suites that need specific
//   matches (e.g. MasterDetailShell) still override this per-test.
// - `Element.prototype.animate`: Svelte 5 transitions drive the Web
//   Animations API, which jsdom does not implement. The stub completes
//   asynchronously so intro/outro transitions settle and outroing elements
//   actually detach.

if (typeof window !== 'undefined') {
	if (typeof window.matchMedia !== 'function') {
		Object.defineProperty(window, 'matchMedia', {
			configurable: true,
			writable: true,
			value: (query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addEventListener: () => {},
				removeEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				dispatchEvent: () => false
			})
		});
	}

	if (typeof Element.prototype.animate !== 'function') {
		class FakeAnimation {
			onfinish: (() => void) | null = null;
			oncancel: (() => void) | null = null;
			currentTime = 0;
			playState = 'running';
			#timer: ReturnType<typeof setTimeout>;

			constructor() {
				this.#timer = setTimeout(() => {
					this.playState = 'finished';
					this.onfinish?.();
				}, 0);
			}

			cancel() {
				clearTimeout(this.#timer);
				this.playState = 'idle';
				this.oncancel?.();
			}

			finish() {
				clearTimeout(this.#timer);
				this.playState = 'finished';
				this.onfinish?.();
			}

			pause() {}
			play() {}
		}

		Object.defineProperty(Element.prototype, 'animate', {
			configurable: true,
			writable: true,
			value: () => new FakeAnimation()
		});
	}
}
