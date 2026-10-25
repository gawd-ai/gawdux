// The approvals ledger: one compact block that says, one line per role, who
// signed what and when, or why a role is not signed yet. Data in, words out:
// the host composes every word (the row notes, the integrity sentence, the
// "approved with" link) and pairs rows with signatures; the ledger draws them,
// each moment at the zone it is given, named. Rendered by ApprovalsLedger.svelte
// and its signatures table, ApprovalsLedgerSignatures.svelte.
/**
 * One row as one line: "Quality · Jane Roe (jane@site) · Approved ·
 * 2026-10-21 14:03:11 EDT", then "Also signed Supplier" and, on a signed row
 * that is not intact, its integrity words. An unsigned row reads its note.
 * `stamp` formats a moment at the site, zone named.
 */
export function ledgerRowText(row, stamp) {
    if (row.state !== 'signed')
        return [row.role, row.note].filter(Boolean).join(' · ');
    const who = row.signer
        ? row.signer.email
            ? `${row.signer.name} (${row.signer.email})`
            : row.signer.name
        : null;
    const parts = [row.role, who, row.meaning, row.signedAt ? stamp(row.signedAt) : null];
    if (row.alsoSigned.length > 0)
        parts.push(`Also signed ${row.alsoSigned.join(', ')}`);
    if (row.note)
        parts.push(row.note);
    return parts.filter(Boolean).join(' · ');
}
