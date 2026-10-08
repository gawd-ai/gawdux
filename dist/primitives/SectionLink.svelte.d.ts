type $$ComponentProps = {
    /** Where it goes, for the screen reader and the tooltip. */
    label: string;
    href?: string;
    onclick?: (event: MouseEvent) => void;
    className?: string;
};
declare const SectionLink: import("svelte").Component<$$ComponentProps, {}, "">;
type SectionLink = ReturnType<typeof SectionLink>;
export default SectionLink;
