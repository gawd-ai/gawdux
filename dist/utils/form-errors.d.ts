export type FieldErrors<Field extends string = string> = Partial<Record<Field, string>>;
export declare function fieldError<Field extends string>(errors: FieldErrors<Field>, field: Field): string;
export declare function hasFieldErrors<Field extends string>(errors: FieldErrors<Field>): boolean;
export declare function clearFieldError<Field extends string>(errors: FieldErrors<Field>, field: Field): FieldErrors<Field>;
export declare function firstFieldError<Field extends string>(errors: FieldErrors<Field>, order: readonly Field[]): Field | undefined;
export declare function focusFirstFieldError(root?: ParentNode): void;
