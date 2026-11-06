/**
 * k6 Load Test: War Ticket Simulation (TERRAFEST ITERA)
 * 
 * Target: NFR-PERF-05 & NFR-PERF-06
 * - Minimal 2.000 concurrent virtual users
 * - 200 claims per second
 * - p95 RPC claim latency < 300ms
 * - Zero overselling guarantee under massive concurrency
 * 
 * Usage:
 *   k6 run tests/load/k6-war-ticket.js
 *   or with env variables:
 *   k6 run -e TARGET_URL=http://localhost:3000 tests/load/k6-war-ticket.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
const successfulClaims = new Counter('successful_claims');
const soldOutResponses = new Counter('sold_out_responses');
const rateLimitedResponses = new Counter('rate_limited_responses');
const claimLatency = new Trend('claim_ticket_duration');
const errorRate = new Rate('system_error_rate');

export const options = {
  scenarios: {
    // 1. Spike / War Ticket Surge (NFR-PERF-06: 2000 VUs, 200 claims/sec)
    war_ticket_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 500 },   // Warm up 500 users
        { duration: '20s', target: 2000 },  // Surge to 2000 concurrent users (War Ticket Begins)
        { duration: '30s', target: 2000 },  // Sustained peak load
        { duration: '10s', target: 0 },     // Ramp down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    // NFR-PERF-05: p95 duration < 300ms under load
    claim_ticket_duration: ['p(95)<300'],
    // System errors (5xx) must be less than 1%
    system_error_rate: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';
const TICKET_TYPE_ID = __ENV.TICKET_TYPE_ID || '00000000-0000-0000-0000-0000000000t1';

export default function () {
  const vuId = __VU;
  const iterId = __ITER;
  const idempotencyKey = `k6-user-${vuId}-iter-${iterId}-${Date.now()}`;

  const payload = JSON.stringify({
    ticket_type_id: TICKET_TYPE_ID,
    quantity: 1,
    idempotency_key: idempotencyKey,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // Simulated authenticated user token header
      'Authorization': `Bearer mock-token-user-${vuId}`,
    },
  };

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/api/tickets/claim`, payload, params);
  const duration = Date.now() - startTime;
  claimLatency.add(duration);

  const isSuccess = check(res, {
    'status is 200 or 400 (expected business statuses)': (r) =>
      r.status === 200 || r.status === 400 || r.status === 429,
  });

  if (!isSuccess || res.status >= 500) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
    try {
      const body = JSON.parse(res.body);
      if (body.code === 'OK') {
        successfulClaims.add(1);
      } else if (body.code === 'SOLD_OUT') {
        soldOutResponses.add(1);
      } else if (body.code === 'RATE_LIMITED' || res.status === 429) {
        rateLimitedResponses.add(1);
      }
    } catch {
      // Body parse fallback
    }
  }

  // Realistic human think time jitter (0.5s - 1.5s)
  sleep(Math.random() * 1.0 + 0.5);
}

