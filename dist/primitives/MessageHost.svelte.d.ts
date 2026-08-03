import type { MessageAction, MessageCenter, MessageCenterItem } from '../utils/message-center';
type $$ComponentProps = {
    center: MessageCenter;
    compactViewport?: boolean;
    suspended?: boolean;
    label?: string;
    dismissLabel?: string;
    onAction?: (item: MessageCenterItem, action: MessageAction) => void;
};
declare const MessageHost: import("svelte").Component<$$ComponentProps, {}, "">;
type MessageHost = ReturnType<typeof MessageHost>;
export default MessageHost;
