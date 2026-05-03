import { check, fail, sleep } from 'k6'
import http from 'k6/http'

const scenario = (__ENV.STRESS_SCENARIO || 'flash-sale').toLowerCase()
const apiBaseUrl = __ENV.API_BASE_URL || 'http://localhost:8000'
const thinkTimeSeconds = Number(__ENV.STRESS_THINK_TIME_SECONDS || 0)
const vus = Number(__ENV.STRESS_VUS || 100)
const iterations = Number(5000)
const maxDuration = __ENV.STRESS_MAX_DURATION || '2m'
const acceptedStatuses = [200, 409]

const checkoutResponseCallback = http.expectedStatuses(...acceptedStatuses)

/**
 * Signs in using the two-step OTP flow.
 * The backend must have SKIP_LOGIN=true — any OTP value will be accepted.
 */
function signIn(email) {
  const signInRes = http.post(`${apiBaseUrl}/api/auth/sign-in`, JSON.stringify({ email }), {
    headers: { 'Content-Type': 'application/json' },
  })

  const signInOk = check(signInRes, { 'sign-in status is 200': (res) => res.status === 200 })
  if (!signInOk) {
    fail(`sign-in failed for ${email}: HTTP ${signInRes.status} — ${signInRes.body}`)
  }

  const { challengeId } = signInRes.json()

  const confirmRes = http.post(
    `${apiBaseUrl}/api/auth/sign-in/confirm`,
    JSON.stringify({ challengeId, otp: '000000' }),
    { headers: { 'Content-Type': 'application/json' } },
  )

  const confirmOk = check(confirmRes, { 'sign-in confirm status is 200': (res) => res.status === 200 })
  if (!confirmOk) {
    fail(
      `sign-in confirm failed for ${email}: HTTP ${confirmRes.status} — ${confirmRes.body}\nHint: ensure SKIP_LOGIN=true on the backend`,
    )
  }

  return confirmRes.json().token
}

export const options = {
  vus,
  iterations,
  maxDuration,
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'max'],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
}

export function setup() {
  // Verify the backend is reachable.
  const pingResponse = http.get(`${apiBaseUrl}/ping`)
  check(pingResponse, { 'ping status is 200': (res) => res.status === 200 })

  if (scenario === 'ping') {
    return { products: [], accessTokens: [] }
  }

  const accessTokens = Array.from({ length: vus }, (_, i) => {
    const email = `stress+vu${i + 1}@test.com`
    return signIn(email)
  })

  const productsResponse = http.get(`${apiBaseUrl}/api/products`)
  const ok = check(productsResponse, {
    'get products status is 200': (res) => res.status === 200,
  })

  if (!ok) {
    fail(`Failed to fetch products: HTTP ${productsResponse.status} — ${productsResponse.body}`)
  }

  const products = productsResponse.json()

  if (!Array.isArray(products) || products.length === 0) {
    fail('No products returned from /api/products — seed the database before running the stress test')
  }

  // get the product with the highest available quantity
  const product = products.reduce((prev, current) => {
    return current.availableQuantity > prev.availableQuantity ? current : prev
  })

  return { product, products, accessTokens }
}

export default function ({ product, accessTokens }) {
  if (scenario === 'ping') {
    const response = http.get(`${apiBaseUrl}/ping`)
    check(response, { 'ping status is 200': (res) => res.status === 200 })
  } else {
    // Each VU uses its own token to act as a distinct user.
    const accessToken = accessTokens[(__VU - 1) % accessTokens.length]

    const body = JSON.stringify({
      items: [{ productId: product.id, quantity: 1 }],
    })

    const response = http.post(`${apiBaseUrl}/api/checkout`, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      responseCallback: checkoutResponseCallback,
    })

    check(response, {
      'checkout status is accepted': (res) => acceptedStatuses.includes(res.status),
      'checkout response time < 2s': (res) => res.timings.duration < 2000,
    })
  }

  if (thinkTimeSeconds > 0) {
    sleep(thinkTimeSeconds)
  }
}
