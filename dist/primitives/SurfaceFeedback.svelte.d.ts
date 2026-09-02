import type { SurfaceFeedbackAction } from './PageFeedback.svelte';
type $$ComponentProps = {
    actionError?: string | null;
    loadError?: string | null;
    loadErrorAction?: SurfaceFeedbackAction | null;
    tone?: 'error' | 'success' | 'info';
    dismissable?: boolean;
    notice?: string | null;
    noticeTone?: 'warning' | 'info' | 'success';
    ondismiss?: () => void;
};
declare const SurfaceFeedback: import("svelte").Component<$$ComponentProps, {}, "">;
type SurfaceFeedback = ReturnType<typeof SurfaceFeedback>;
export default SurfaceFeedback;
