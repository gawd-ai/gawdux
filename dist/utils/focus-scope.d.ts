export interface FocusScopePorts {
    document: Document;
    eventTarget: EventTarget;
    root(): HTMLElement | null | undefined;
    background(): Iterable<HTMLElement>;
    initialFocus?(): HTMLElement | null | undefined;
    onEscape?(): void;
    onLink?(link: HTMLAnchorElement): void;
    /** Test or non-layout host port; ordinary browsers use rendered client rects. */
    isVisible?(element: HTMLElement): boolean;
}
/**
 * Explicit-lifetime focus containment. No browser globals are read at import or
 * construction. Resource locks preserve pre-existing values and nested owners,
 * including teardown in a different order from activation.
 */
export declare function activateFocusScope(ports: FocusScopePorts): () => void;
