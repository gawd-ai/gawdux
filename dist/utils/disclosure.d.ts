export interface DisclosurePorts {
    isOpen(): boolean;
    setOpen(open: boolean): void;
    root(): HTMLElement | null | undefined;
    trigger?(): HTMLElement | null | undefined;
}
export interface DisclosureController {
    toggle(): void;
    close(options?: {
        restoreFocus?: boolean;
    }): void;
    bind(target: EventTarget): () => void;
}
/** Caller-owned state and elements; listeners exist only for an explicit binding. */
export declare function createDisclosureController(ports: DisclosurePorts): DisclosureController;
