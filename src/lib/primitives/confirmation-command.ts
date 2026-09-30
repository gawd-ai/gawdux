import type { Component } from 'svelte';

export type ConfirmationCommandColor = 'red' | 'green' | 'blue';

export interface ConfirmationCommandRequest {
	id: number;
	title: string;
	message: string;
	confirmLabel: string;
	busyLabel?: string;
	confirmColor?: ConfirmationCommandColor;
	focusTarget: HTMLElement | null;
	focusFallback?: () => HTMLElement | null;
}

/** An opt-in presentation owns its markup, keyboard interaction and focus. */
export interface ConfirmationCommandPresentationProps {
	request: ConfirmationCommandRequest;
	busy: boolean;
	error: string | null;
	onconfirm: () => void;
	oncancel: () => void;
}

export interface ConfirmationCommandSurfaceProps {
	request: ConfirmationCommandRequest | null;
	busy?: boolean;
	error?: string | null;
	/** Omit to retain the existing drawer presentation. */
	presentation?: Component<ConfirmationCommandPresentationProps>;
	onconfirm: () => void;
	oncancel: () => void;
}
