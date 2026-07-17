# AI Page Analysis Current Security Boundary

This document is the current production boundary for `/api/analyze`. The D9/D10 plans and acceptance reports remain historical records; where they describe capture as the default path, this document supersedes them.

## Default behavior

- Public URL capture is **off by default**. Missing values and every value other than the exact server-side string `AI_PAGE_ANALYSIS_ENABLE_PUBLIC_CAPTURE=true` keep it off.
- With capture off, URL mode validates the input and returns deterministic Safe Mock output. It does not resolve the submitted hostname or open an outbound connection.
- The result always exposes `safe_mock_api: true`. `source.capture.performed` is the authoritative capture signal; `source.capture.captured_at` and `final_url` only exist after a successful enabled capture.
- No mode calls a live model or persists the submitted input or result.

## Inbound resource boundary

| Control | Boundary |
|---|---|
| JSON request body | Streamed and stopped at 16 KiB; no `request.json()` buffering |
| Per-process identity gate | 5 attempts per 15 minutes; rejection is HTTP `429` |
| Per-process analysis concurrency | 2 active analyses; rejection is HTTP `503` with `Retry-After` |
| Nginx | Exact `/api/analyze` location, 16 KiB body, per-IP request limit, global connection limit 2 |

The in-memory gates assume one Node process. They are not a distributed quota. Do not enable cluster mode or multiple replicas until the gates move to a shared atomic authority.

## Enabled capture boundary

For every initial URL and redirect hop:

1. Accept only HTTP/HTTPS without embedded credentials.
2. Reject local/special hostnames and parse every DNS answer as an IP address.
3. Reject non-public IPv4, IPv4-mapped IPv6, documentation, benchmark, multicast, link-local, loopback, unspecified, and metadata targets. Outbound capture connects only through a directly routable IPv4 address; IPv6-only and translation candidates are never selected.
4. Reject the entire hop if **any** returned address is unsafe.
5. Select a validated IPv4 address and pass it to a Node HTTP(S) request through a custom `lookup` callback. The connection therefore uses that address instead of resolving the hostname a second time. The original hostname remains the HTTP Host and TLS SNI/certificate name.
6. Do not reuse a pooled agent. A redirect starts again at step 1 and receives a newly pinned address.

Additional hard limits are a 10-second total capture window including DNS, three redirects, a 2 MiB streamed response-body limit, a 240-character extracted title, manual redirects, fixed request headers with `Accept-Encoding: identity`, and no authenticated-page support. Redirect and declared-oversized response bodies are cancelled rather than retained.

## Honest output semantics

Capture and result generation are separate. Even when optional capture succeeds, scoring, issues, recommendations, confidence, and backlog remain deterministic Safe Mock output. The UI states either “URL not fetched” or “public page captured; output remains a mock”; it never turns capture success into a claim that a model analyzed the live page.

## Operational enablement

Keep the flag false until all of these are true:

- the documented Nginx `/api/analyze` location is active and `nginx.exe -t` passes;
- one and only one Node instance is serving the site;
- `/api/analyze/healthz` reports the intended `public_capture_enabled` value after a full process restart;
- outbound network policy and logs have been reviewed;
- a test uses only an administrator-controlled public page.

Rollback is setting the variable to `false` (or removing it) and fully restarting the Node process. Safe Mock remains available after rollback.

## Residual limits

Address pinning removes the previous DNS-check/ordinary-fetch time-of-check/time-of-use gap in this implementation. IPv4-only outbound capture also avoids operator-specific NAT64/transition prefixes that cannot be proven safe from IPv6 syntax alone. It does not make arbitrary web content trustworthy: HTML is treated only as bounded text, content can still be deceptive, public targets can be slow within the timeout, and upstream/CDN behavior can change between requests. The default-off flag, strict limits, and optional outbound firewall policy remain defense in depth.
