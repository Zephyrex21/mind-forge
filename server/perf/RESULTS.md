# Load Test Results

Real numbers from `npm run loadtest`, not estimates. Regenerate any time with:

```bash
cd server
npm run loadtest
```

## Latest run

| Endpoint                        | Auth? | DB?          | req/sec (avg) | p50 latency | p99 latency |
| -------------------------------- | ----- | ------------ | -------------- | ----------- | ----------- |
| `GET /api/health`                 | No    | No           | ~4,700         | 2ms         | 23ms        |
| `GET /api/checkins`                | Yes   | Mocked       | ~2,070         | 8ms         | 34ms        |
| `GET /api/checkins/analytics`      | Yes   | Mocked       | ~2,320         | 7ms         | 29ms        |

20 concurrent connections, 5 seconds per endpoint. Zero errors, zero non-2xx responses across all three runs.

## What these numbers actually mean

**The honest scope limitation, stated plainly:** the database layer is mocked with an in-memory fake (same approach as the integration tests) — there's no live MongoDB reachable from the environment these were measured in. So this is **not** "the app can serve N requests/sec against a real database in production." It's narrower and more specific than that: it's how much overhead the app's own code — JWT verification, the request logger, validation, routing — adds on top of whatever the database itself contributes.

That's still useful, for two reasons:
1. **It's the part actually in this codebase's control.** Real MongoDB Atlas latency depends on cluster tier, region, and network path — none of which this project's code affects. The auth/middleware/validation layer above it is exactly what a code change here could speed up or slow down.
2. **The auth overhead is now a known, measured number.** Comparing the unauthenticated `/api/health` baseline (~4,700 req/sec) to the authenticated endpoints (~2,000-2,300 req/sec) shows JWT verification plus route logic costs roughly 2-3ms per request at this scale — worth knowing before assuming auth is "basically free."

**What would change with a real database:** almost certainly the bottleneck, in any realistic production scenario. A real MongoDB round trip (even to a well-placed Atlas cluster) typically costs single-digit-to-tens of milliseconds depending on query complexity and network distance — likely more than the entire app-layer overhead measured here combined. These numbers describe a ceiling on how fast the app *could* be with an infinitely fast database, not a prediction of real-world throughput.

## Why this isn't part of CI

Load test results vary with whatever else is running on the same machine — a shared CI runner will produce noisier, less comparable numbers than a dedicated run. It's a manual/periodic check (run it after a change you suspect might affect performance, or periodically as a sanity check), not a per-PR gate.

## Rate limiting: a policy decision, not a bottleneck

The load test above deliberately runs with the global rate limiter bypassed (`NODE_ENV=test`) — measuring "how many requests/sec can we sustain against a 100-req/min limiter" would just report the limiter's configured number back, telling you nothing about the app's actual capacity.

The limiter's *enforcement* (not just its configuration) is verified separately in `middleware/rateLimiter.test.js`, which is part of the regular test suite: it fires 105 real requests and asserts that exactly the first 100 succeed and the last 5 get a 429, confirming the cutoff is a hard, correct boundary rather than something merely configured and hoped-for.
