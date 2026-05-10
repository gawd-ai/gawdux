export type FieldErrors<Field extends string = string> = Partial<Record<Field, string>>;

export function fieldError<Field extends string>(errors: FieldErrors<Field>, field: Field): string {
	return errors[field]?.trim() ?? '';
}

export function hasFieldErrors<Field extends string>(errors: FieldErrors<Field>): boolean {
	return Object.values(errors).some(
		(message) => typeof message === 'string' && message.trim().length > 0
	);
}

export function clearFieldError<Field extends string>(
	errors: FieldErrors<Field>,
	field: Field
): FieldErrors<Field> {
	if (!errors[field]) return errors;
	const nextErrors = { ...errors };
	delete nextErrors[field];
	return nextErrors;
}

export function firstFieldError<Field extends string>(
	errors: FieldErrors<Field>,
	order: readonly Field[]
): Field | undefined {
	return order.find((field) => fieldError(errors, field).length > 0);
}

export function focusFirstFieldError(root: ParentNode = document): void {
	if (typeof requestAnimationFrame === 'undefined') return;
	requestAnimationFrame(() => {
		const target = root.querySelector<HTMLElement>(
			'[aria-invalid="true"], [data-field-error-message]'
		);
		target?.focus();
		target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	});
}
