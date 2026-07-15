/** Presentation descriptor for one currently applied list filter. */
export interface ActiveFilterDescriptor {
    /** Stable identity used for keyed rendering and removal. */
    id: string;
    /** Filter name, for example "Status". */
    label: string;
    /** Optional selected value, for example "Open". */
    value?: string;
    /** Accessible override for the chip's remove button. */
    removeLabel?: string;
}
