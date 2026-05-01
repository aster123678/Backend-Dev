import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ramp_to_100k_rpm: {
      executor: 'ramping-arrival-rate',
      startRate: 1000,
      timeUnit: '1m',
      preAllocatedVUs: 1000,
      maxVUs: 10000,
      stages: [
        { target: 100000, duration: '20m' },
        { target: 100000, duration: '20m' }
      ]
    },
    ramp_to_500k_rpm: {
      executor: 'ramping-arrival-rate',
      startRate: 100000,
      timeUnit: '1m',
      preAllocatedVUs: 5000,
      maxVUs: 50000,
      stages: [
        { target: 500000, duration: '30m' },
        { target: 500000, duration: '30m' }
      ]
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01']
  }
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'https://peak-ecommerce-platform.herokuapp.com';
  const product = http.get(`${baseUrl}/products/black-friday-item`);
  check(product, { 'product page ok': (r) => r.status === 200 });

  const checkout = http.post(`${baseUrl}/checkout`, JSON.stringify({
    customerId: `load-user-${__VU}`,
    amount: 49.99,
    items: [{ sku: 'BF-ITEM', quantity: 1 }]
  }), { headers: { 'content-type': 'application/json' } });
  check(checkout, { 'checkout accepted': (r) => r.status === 202 });
  sleep(1);
}

