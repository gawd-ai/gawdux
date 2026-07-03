type $$ComponentProps = {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    id?: string;
    /** Fires on typed input (not on clear — wire `onclear` for that). */
    oninput?: () => void;
    /** Fires when the × button or Escape clears the field. */
    onclear?: () => void;
    inputEl?: HTMLInputElement | null;
};
declare const SearchInput: import("svelte").Component<$$ComponentProps, {}, "value" | "inputEl">;
type SearchInput = ReturnType<typeof SearchInput>;
export default SearchInput;
