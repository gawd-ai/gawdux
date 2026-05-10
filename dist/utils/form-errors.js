export function fieldError(errors, field) {
    return errors[field]?.trim() ?? '';
}
export function hasFieldErrors(errors) {
    return Object.values(errors).some((message) => typeof message === 'string' && message.trim().length > 0);
}
export function clearFieldError(errors, field) {
    if (!errors[field])
        return errors;
    const nextErrors = { ...errors };
    delete nextErrors[field];
    return nextErrors;
}
export function firstFieldError(errors, order) {
    return order.find((field) => fieldError(errors, field).length > 0);
}
export function focusFirstFieldError(root = document) {
    if (typeof requestAnimationFrame === 'undefined')
        return;
    requestAnimationFrame(() => {
        const target = root.querySelector('[aria-invalid="true"], [data-field-error-message]');
        target?.focus();
        target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
}
