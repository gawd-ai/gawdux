/** One live-checked requirement. Consumers own the rule list (and any
 * server-side validation that mirrors it); the panel only renders and
 * re-evaluates `test(value)` as the user types. */
export interface PasswordRequirementRule {
    label: string;
    test: (value: string) => boolean;
}
import type { Snippet } from 'svelte';
interface Props {
    value: string;
    /** Canonical password rules for this surface; checkmarks derive from it. */
    rules: readonly PasswordRequirementRule[];
    confirm?: string;
    label?: string;
    confirmLabel?: string;
    name?: string;
    confirmName?: string;
    showConfirm?: boolean;
    autocomplete?: 'new-password' | 'current-password';
    requirementsLabel?: string;
    ruleLabels?: readonly string[];
    confirmationRuleLabel?: string;
    showPasswordLabel?: string;
    hidePasswordLabel?: string;
    showConfirmationLabel?: string;
    hideConfirmationLabel?: string;
    /** In-app density: house `form-input` fields (no lock adornment) and a
     * tighter requirements panel. Default keeps the pre-auth scale used by
     * signup/invite/reset/change-password. */
    compact?: boolean;
    /** 'split' puts the requirements panel beside the fields on wide
     * viewports instead of below them — for app surfaces where the stacked
     * pre-auth arrangement reads as dead space. */
    layout?: 'stack' | 'split';
    /** Rendered above the password field inside the fields column (e.g. a
     * current-password input on the self-serve profile page). */
    leading?: Snippet;
}
declare const PasswordWithRequirements: import("svelte").Component<Props, {}, "value" | "confirm">;
type PasswordWithRequirements = ReturnType<typeof PasswordWithRequirements>;
export default PasswordWithRequirements;
