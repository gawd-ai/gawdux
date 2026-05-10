type IconComponent = any;
type Permish = boolean | null | undefined;
export type LifecycleAction = {
    kind: 'add';
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: IconComponent;
    perm?: Permish;
    disabled?: boolean;
} | {
    kind: 'view';
    label: string;
    href: string;
    icon?: IconComponent;
    perm?: Permish;
    disabled?: boolean;
} | {
    kind: 'pdf';
    href: string;
    label?: string;
    perm?: Permish;
    disabled?: boolean;
} | {
    kind: 'archive';
    table: string;
    id: string | number;
    archived: boolean;
    label?: string;
    restoreLabel?: string;
    perm?: Permish;
} | {
    kind: 'retire';
    table: string;
    id: string | number;
    retired: boolean;
    perm?: Permish;
} | {
    kind: 'status';
    label: string;
    tone: 'red' | 'green';
    icon?: IconComponent;
    onClick: () => void;
    perm?: Permish;
    disabled?: boolean;
} | {
    kind: 'custom';
    label: string;
    color?: 'blue' | 'red' | 'green';
    icon?: IconComponent;
    href?: string;
    onClick?: () => void;
    perm?: Permish;
    disabled?: boolean;
};
export interface EditModeProps {
    isEditing: boolean;
    canEdit: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onSaveAsDraft?: () => void;
    showSaveAsDraft?: boolean;
    saveLabel?: string;
    saveAsDraftLabel?: string;
    /** When true, Cancel / Save / Save-as-Draft are disabled and Save labels swap to "Saving…". */
    saving?: boolean;
}
/** Component renderers for domain-coupled lifecycle kinds. Consumer apps
    that emit `kind: 'archive' | 'retire'` actions supply concrete buttons
    here (the bar avoids importing app-specific API/UI directly). When a
    matching renderer is missing, the bar silently skips the action. */
export type LifecycleKindRenderers = {
    archive?: IconComponent;
    retire?: IconComponent;
};
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import('svelte').ComponentConstructorOptions<Props>): import('svelte').SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: Props & {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
declare const PageActionBar: $$__sveltets_2_IsomorphicComponent<{
    editMode?: EditModeProps | null;
    lifecycle?: LifecycleAction[];
    kindRenderers?: LifecycleKindRenderers;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type PageActionBar = InstanceType<typeof PageActionBar>;
export default PageActionBar;
