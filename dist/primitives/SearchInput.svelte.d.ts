export type SearchInputSize = 'compact' | 'standard';
import type { HTMLInputAttributes } from 'svelte/elements';
type $$ComponentProps = {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    id?: string;
    size?: SearchInputSize;
    busy?: boolean;
    busyLabel?: string;
    disabled?: boolean;
    className?: string;
    role?: 'searchbox' | 'combobox';
    ariaControls?: string;
    ariaExpanded?: boolean;
    ariaAutocomplete?: 'none' | 'inline' | 'list' | 'both';
    ariaActiveDescendant?: string | undefined;
    autocomplete?: HTMLInputAttributes['autocomplete'];
    clearLabel?: string;
    /** Fires on typed input (not on clear; wire `onclear` for that). */
    oninput?: () => void;
    onkeydown?: (event: KeyboardEvent) => void;
    /** Fires when the clear button or Escape clears the field. */
    onclear?: () => void;
    /** Fires on Enter. Native form submission is preserved when omitted. */
    onsubmit?: (value: string) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
    inputEl?: HTMLInputElement | null;
};
declare const SearchInput: import("svelte").Component<$$ComponentProps, {}, "value" | "inputEl">;
type SearchInput = ReturnType<typeof SearchInput>;
export default SearchInput;
