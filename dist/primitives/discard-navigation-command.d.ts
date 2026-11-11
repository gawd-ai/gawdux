import type { DiscardNavigationRequest } from "../utils/discard-navigation.svelte";
export interface DiscardNavigationCommandSurfaceProps {
    request: DiscardNavigationRequest | null;
    pending?: boolean;
    oncancel: (request: DiscardNavigationRequest) => void;
    oncomplete: (request: DiscardNavigationRequest) => void;
}
