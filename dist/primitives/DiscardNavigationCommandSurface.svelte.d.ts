import type { DiscardNavigationRequest } from '../utils/discard-navigation.svelte';
type $$ComponentProps = {
    request: DiscardNavigationRequest | null;
    pending?: boolean;
    anchorBottom?: boolean;
    oncancel: (request: DiscardNavigationRequest) => void;
    oncomplete: (request: DiscardNavigationRequest) => void;
};
declare const DiscardNavigationCommandSurface: import("svelte").Component<$$ComponentProps, {}, "pending">;
type DiscardNavigationCommandSurface = ReturnType<typeof DiscardNavigationCommandSurface>;
export default DiscardNavigationCommandSurface;
