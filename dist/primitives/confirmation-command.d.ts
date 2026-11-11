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
/** The house presentation's props: it owns the markup, the keys and the focus. */
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
    onconfirm: () => void;
    oncancel: () => void;
}
