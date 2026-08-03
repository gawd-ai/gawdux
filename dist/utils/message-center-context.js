import { getContext } from 'svelte';
export const APP_MESSAGE_CENTER_CONTEXT = Symbol('gawdux.app-message-center');
export function getAppMessageCenter() {
    const center = getContext(APP_MESSAGE_CENTER_CONTEXT);
    if (!center)
        throw new Error('App message center is unavailable outside the app shell');
    return center;
}
