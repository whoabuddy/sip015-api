# SIP-015 API

A simple API to return data stored by the [SIP-015 Indexer](https://github.com/whoabuddy/sip015-indexer).

- Production deployment: https://api.sip015.xyz
- Testing deployment: https://sip015-api.chaos.workers.dev

The architecture uses Cloudflare [Workers](https://developers.cloudflare.com/workers/) and [KV](https://developers.cloudflare.com/workers/runtime-apis/kv/).

Supported routes will fetch and return data, or 404 if a key is not found.

Unsupported routes will display the index page.

> **ALPHA:** The endpoints listed here may change as interactions between this and the indexer are adjusted.

## Supported Routes

- `/data` - returns all known keys in Cloudflare KV store
- `/addresses` - returns all known voting addresses in Cloudflare KV store
- `/method2-vote` - returns compiled vote stats for SIP-015
- `/method2-vote-details` - returns compiled vote data for SIP-015
- `/method2-invalid-votes` - returns stats on invalid votes for SIP-015
- `/` or invalid path - returns this info

Types for each object queried can be found in [utils.ts](./src/utils.ts).
