/**
 * The first sentence of the sign drawer (SignatureCommandSurface): which
 * step, on what, with which meaning. The meaning is the host's, as its
 * signature service decides it; the drawer states it before the signer
 * confirms.
 */
export declare function signatureStatement(input: {
    step: string;
    subject: string;
    meaning: string;
}): string;
