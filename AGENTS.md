# Agent Bootstrap

gawdux is the shared UI library: primitives, tokens and interaction defaults
for every gawd product. It is upstream of its consumers and independent of
all of them.

Working rules:

- **This repository has no knowledge of anything downstream.** Never write the
  name of a consumer product, its company, its customers or its servers: not
  in code, comments, tests, documents, the changelog, a file name or a commit
  message. Say "a consumer", "the host application", or cite provenance by
  anonymous label (`product-a@<sha>:<path>`). Which product a label is lives
  in the private operations register, outside every repository. This is a rule
  you keep while writing, not something a reviewer is expected to catch
  afterwards.
- Peer gawd libraries (gawdbase, gawdchat, gawdclaw, sctl) are siblings, not
  consumers, and are named openly.
- A behaviour learned from a consumer's bug is upstream knowledge; the
  consumer's identity is not. Describe the shape of the bug, not whose it was.
- Commits: plain messages, identity `Alex Grenier <alex@gawd.ai>`, no AI
  co-author trailers.
