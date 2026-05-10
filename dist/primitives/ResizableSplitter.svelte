<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	/** Bound: current width of the LEFT side in pixels. Updates live during drag. */
	export let width: number;
	export let minWidth = 200;
	export let maxWidth = 800;
	/** Optional localStorage key. When set, the splitter persists `width` on release. */
	export let storageKey: string | null = null;
	/** Pixel step for keyboard arrow adjustments. */
	export let keyboardStep = 16;

	const dispatch = createEventDispatcher<{ change: { width: number } }>();

	let dragging = false;
	let dragStartX = 0;
	let dragStartWidth = 0;

	onMount(() => {
		if (!storageKey) return;
		try {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				const n = Number(stored);
				if (Number.isFinite(n) && n >= minWidth && n <= maxWidth) {
					width = n;
				}
			}
		} catch {
			// ignore quota / privacy errors
		}
	});

	function clamp(n: number): number {
		return Math.max(minWidth, Math.min(maxWidth, n));
	}

	function persist() {
		if (!storageKey) return;
		try {
			localStorage.setItem(storageKey, String(width));
		} catch {
			// ignore
		}
	}

	function onPointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		dragging = true;
		dragStartX = e.clientX;
		dragStartWidth = width;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		document.body.style.userSelect = 'none';
		document.body.style.cursor = 'col-resize';
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		const next = clamp(dragStartWidth + (e.clientX - dragStartX));
		if (next !== width) {
			width = next;
			dispatch('change', { width });
		}
	}

	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		document.body.style.userSelect = '';
		document.body.style.cursor = '';
		persist();
	}

	function onKeyDown(e: KeyboardEvent) {
		let next = width;
		if (e.key === 'ArrowLeft') next = clamp(width - keyboardStep);
		else if (e.key === 'ArrowRight') next = clamp(width + keyboardStep);
		else if (e.key === 'Home') next = minWidth;
		else if (e.key === 'End') next = maxWidth;
		else return;
		e.preventDefault();
		if (next !== width) {
			width = next;
			dispatch('change', { width });
			persist();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
<div
	role="separator"
	aria-orientation="vertical"
	aria-valuenow={width}
	aria-valuemin={minWidth}
	aria-valuemax={maxWidth}
	aria-label="Resize column"
	tabindex="0"
	class="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-blue-500/30 active:bg-blue-500/50 focus:bg-blue-500/40 focus:outline-none transition-colors"
	class:bg-blue-500={dragging}
	on:pointerdown={onPointerDown}
	on:pointermove={onPointerMove}
	on:pointerup={onPointerUp}
	on:pointercancel={onPointerUp}
	on:keydown={onKeyDown}
></div>
