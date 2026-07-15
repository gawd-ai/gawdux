import type { ActiveFilterDescriptor } from './list-query';
type $$ComponentProps = {
    filter: ActiveFilterDescriptor;
    onRemove?: (filter: ActiveFilterDescriptor) => void;
    disabled?: boolean;
};
declare const ActiveFilterChip: import("svelte").Component<$$ComponentProps, {}, "">;
type ActiveFilterChip = ReturnType<typeof ActiveFilterChip>;
export default ActiveFilterChip;
