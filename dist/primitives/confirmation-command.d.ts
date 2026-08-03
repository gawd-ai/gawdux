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
