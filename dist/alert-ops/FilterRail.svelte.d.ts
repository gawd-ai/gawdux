import { type AlertOpsCopy, type AlertOpsFilters, type AlertOpsScope } from './types';
type $$ComponentProps = {
    scope: AlertOpsScope;
    filters?: AlertOpsFilters;
    copy?: Partial<AlertOpsCopy>;
    disabled?: boolean;
    onchange?: (filters: AlertOpsFilters) => void;
};
declare const FilterRail: import("svelte").Component<$$ComponentProps, {}, "filters">;
type FilterRail = ReturnType<typeof FilterRail>;
export default FilterRail;
