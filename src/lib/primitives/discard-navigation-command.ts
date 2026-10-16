import type { Component } from "svelte";
import type { DiscardNavigationRequest } from "../utils/discard-navigation.svelte";

/** An optional view owns its markup, initial focus and keyboard interaction. */
export interface DiscardNavigationCommandPresentationProps {
  request: DiscardNavigationRequest;
  pending: boolean;
  error: string | null;
  onconfirm: () => void;
  oncancel: () => void;
}

export interface DiscardNavigationCommandSurfaceProps {
  request: DiscardNavigationRequest | null;
  pending?: boolean;
  anchorBottom?: boolean;
  presentation?: Component<DiscardNavigationCommandPresentationProps>;
  oncancel: (request: DiscardNavigationRequest) => void;
  oncomplete: (request: DiscardNavigationRequest) => void;
}
