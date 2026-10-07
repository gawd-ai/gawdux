const ALIGN_CLASS = {
    left: '',
    center: 'text-center',
    right: 'text-right'
};
export function dataTableAlignClass(align) {
    return align ? ALIGN_CLASS[align] : '';
}
/** The row-click guard: a click on a control inside the row is that
    control's, never the row's (the list-table row-click rule). */
export function isRowClickTarget(event) {
    const target = event.target;
    if (!(target instanceof Element))
        return true;
    return !target.closest('button, a, [role="button"], input, select, textarea, label, summary');
}
