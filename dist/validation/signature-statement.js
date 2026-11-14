/**
 * The first sentence of the sign drawer (SignatureCommandSurface): which
 * step, on what, with which meaning. The meaning is the host's, as its
 * signature service decides it; the drawer states it before the signer
 * confirms.
 */
export function signatureStatement(input) {
    return `You are about to sign step ${input.step} on ${input.subject} with the meaning ${input.meaning}.`;
}
