import { getContext } from 'svelte';
import type { MessageCenter } from './message-center';

export const APP_MESSAGE_CENTER_CONTEXT = Symbol('gawdux.app-message-center');

export function getAppMessageCenter(): MessageCenter {
	const center = getContext<MessageCenter | undefined>(APP_MESSAGE_CENTER_CONTEXT);
	if (!center) throw new Error('App message center is unavailable outside the app shell');
	return center;
}
