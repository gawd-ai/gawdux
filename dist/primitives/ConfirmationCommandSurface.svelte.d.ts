import type { ConfirmationCommandRequest } from './confirmation-command';
type $$ComponentProps = {
    request: ConfirmationCommandRequest | null;
    busy?: boolean;
    error?: string | null;
    onconfirm: () => void;
    oncancel: () => void;
};
declare const ConfirmationCommandSurface: import("svelte").Component<$$ComponentProps, {}, "">;
type ConfirmationCommandSurface = ReturnType<typeof ConfirmationCommandSurface>;
export default ConfirmationCommandSurface;
