const ALIGN_CLASS = {
    left: '',
    center: 'text-center',
    right: 'text-right'
};
export function dataTableAlignClass(align) {
    return align ? ALIGN_CLASS[align] : '';
}
/** The row-click guard is the row link's (`utils/row-link`): one guard for a
    row that opens a page and a row that answers a click of its own. */
export { isRowClickTarget } from '../utils/row-link';
