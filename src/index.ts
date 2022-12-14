import {
  dbgLog,
  Env,
  StxInvalidVoteStats,
  StxVoteMethodData,
  STX_ADDRESS_NO,
  STX_ADDRESS_YES,
} from "./utils";

const simpleRouter = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> => {
  const requestUrl = new URL(request.url);
  dbgLog(`path: ${requestUrl.pathname}`);

  switch (requestUrl.pathname) {
    case "/data": {
      dbgLog("fetching all keys from KV");
      const kvKeyList = await env.sip015_index.list();
      dbgLog("responding with all data in KV");
      return new Response(JSON.stringify(kvKeyList, null, 2));
    }
    /* taking out for now
    case "/reset": {
      const kvKeyList = await env.sip015_index.list();
      for (const key of kvKeyList.keys) {
        dbgLog(`removing key: ${key.name}`);
        await env.sip015_index.delete(key.name);
      }
      return new Response("reset complete");
    }
    */
    case "/addresses": {
      dbgLog("fetching key from KV");
      const key = await env.sip015_index.get("sip015-stx-knownaddresses");
      return key
        ? new Response(key)
        : new Response("not found", { status: 404 });
    }
    /* TODO: better router for matching query param here
    case "/view-user-data": {
      dbgLog("fetching key from KV");
      const key = await env.sip015_index.get(
        "sip015-stx-userdata-SP1019HHYMH7619HGRZM9PKRJMAG0256EBBC3NZ6E"
      );
      return key ? new Response(key) : new Response("not found");
    }
    */
    case "/method2-vote": {
      dbgLog("fetching key from KV");
      const { value, metadata } = await env.sip015_index.getWithMetadata(
        "sip015-stx-method2-vote",
        {
          type: "json",
        }
      );
      return value && metadata
        ? new Response(JSON.stringify(metadata))
        : new Response("not found", { status: 404 });
    }
    case "/method2-vote-details": {
      dbgLog("fetching key from KV");
      const { value, metadata } = await env.sip015_index.getWithMetadata(
        "sip015-stx-method2-vote",
        {
          type: "json",
        }
      );
      if (value && metadata) {
        const compiled = {
          value,
          metadata,
        };
        return new Response(JSON.stringify(compiled));
      }
      return new Response("not found", { status: 404 });
    }
    case "/method2-yes-votes": {
      dbgLog("fetching key from KV");
      const { value, metadata } = await env.sip015_index.getWithMetadata(
        `sip015-stx-votetxs-${STX_ADDRESS_YES}`,
        {
          type: "json",
        }
      );
      if (value && metadata) {
        const compiled = {
          txs: value,
          metadata: metadata,
        };
        return new Response(JSON.stringify(compiled));
      }
      return new Response("not found", { status: 404 });
    }
    case "/method2-no-votes": {
      dbgLog("fetching key from KV");
      const { value, metadata } = await env.sip015_index.getWithMetadata(
        `sip015-stx-votetxs-${STX_ADDRESS_NO}`,
        {
          type: "json",
        }
      );
      if (value && metadata) {
        const compiled = {
          txs: value,
          metadata: metadata,
        };
        return new Response(JSON.stringify(compiled));
      }
      return new Response("not found", { status: 404 });
    }
    case "/method2-invalid-votes": {
      dbgLog("fetching key from KV");
      const { value, metadata } = await env.sip015_index.getWithMetadata(
        "sip015-stx-method2-vote",
        {
          type: "json",
        }
      );
      if (value && metadata) {
        const voteData = value as StxVoteMethodData;
        const invalidVoteStats: StxInvalidVoteStats = {
          totalInvalidVotes: Object.keys(voteData.invalidVotes).length,
          totalsByReason: {},
        };
        const invalidVoteReasons = voteData.invalidVoteReasons;
        for (const [key, value] of Object.entries(invalidVoteReasons)) {
          if (invalidVoteStats.totalsByReason[value]) {
            invalidVoteStats.totalsByReason[value] += 1;
          } else {
            invalidVoteStats.totalsByReason[value] = 1;
          }
        }
        return new Response(JSON.stringify(invalidVoteStats, null, 2));
      }
      return new Response("not found", { status: 404 });
    }
    default:
      return new Response(
        `Simple API for SIP-015 voting data, supported routes:\n
          /data - returns all known keys in Cloudflare KV store
          /addresses - returns all known voting addresses in Cloudflare KV store
          /method2-vote - returns compiled vote stats for SIP-015
          /method2-vote-details - returns compiled vote data for SIP-015
          /method2-yes-votes - returns indexed transactions and stats on yes votes for SIP-015
          /method2-no-votes - returns indexed transactions and stats on no votes for SIP-015
          /method2-invalid-votes - returns stats on invalid votes for SIP-015
          / - returns this page`
      );
  }
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // get response from router
    const response = await simpleRouter(request, env, ctx);
    // create new response with CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    newResponse.headers.set("Access-Control-Max-Age", "86400");
    newResponse.headers.set("X-Stacks-Indexer", "0.0.1");
    return newResponse;
  },
};
