// The approvals ledger: one compact block that says, one line per role, who
// signed what and when, or why a role is not signed yet. Data in, words out:
// the host composes every word (the row notes, the integrity sentence, the
// "approved with" link) and pairs rows with signatures; the ledger draws them,
// each moment at the zone it is given, named. Rendered by ApprovalsLedger.svelte
// and its signatures table, ApprovalsLedgerSignatures.svelte.
/**
 * One row in its parts, in order, a part the row does not carry left out: the
 * role, the signer, the meaning, the moment, "Also signed Supplier" and the
 * note (on a signed row that is not intact, its integrity words). An unsigned
 * row is its role and its note. `stamp` formats a moment at the site, zone
 * named. A surface draws each part as a run of its own, so the row wraps
 * between its parts and never inside the moment: a stamp broken inside itself
 * ("2026-10-21" over "14:03:11 EDT") reads as two facts.
 */
export function ledgerRowParts(row, stamp) {
    const parts = [['role', row.role]];
    if (row.state === 'signed') {
        const who = row.signer
            ? row.signer.email
                ? `${row.signer.name} (${row.signer.email})`
                : row.signer.name
            : null;
        parts.push(['signer', who], ['meaning', row.meaning]);
        parts.push(['at', row.signedAt ? stamp(row.signedAt) : null]);
        if (row.alsoSigned.length > 0)
            parts.push(['also', `Also signed ${row.alsoSigned.join(', ')}`]);
    }
    parts.push(['note', row.note]);
    return parts.flatMap(([kind, text]) => (text ? [{ kind, text }] : []));
}
/**
 * What a surface draws between a row's parts: a no-break space, the dot, a
 * space. The dot stays with the part before it, so a row that wraps ends a
 * line on "Approved ·" and never begins one with "· 2026-11-07 10:31:03 EST".
 */
export const LEDGER_PART_SEPARATOR = '\u00a0· ';
/**
 * One row as one line, its parts joined: "Quality · Jane Roe (jane@site) ·
 * Approved · 2026-10-21 14:03:11 EDT", then "Also signed Supplier" and, on a
 * signed row that is not intact, its integrity words. An unsigned row reads
 * its note.
 */
export function ledgerRowText(row, stamp) {
    return ledgerRowParts(row, stamp)
        .map((part) => part.text)
        .join(' · ');
}
