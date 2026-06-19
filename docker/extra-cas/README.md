# Extra CA certificates (optional)

Drop PEM-encoded `*.crt` files in this directory to make the Docker image build
trust additional certificate authorities — typically a **corporate / egress TLS
proxy** that intercepts HTTPS (which would otherwise break `npm` with
`SELF_SIGNED_CERT_IN_CHAIN`).

At build time every `*.crt` here is concatenated into a bundle exposed to Node
via `NODE_EXTRA_CA_CERTS`. When the directory contains no `*.crt` (the default),
the step is a harmless no-op.

`*.crt` files are git-ignored on purpose — they are environment-specific and
must not be committed.
