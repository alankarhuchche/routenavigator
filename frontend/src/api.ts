import type { ApiDecisionTrace, ApiExplanationResponse, ApiIntentClassificationResponse, ApiPaymentSnapshot } from './apiTypes'

async function requireOk(res: Response): Promise<Response> {
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res
}

export async function createRouteDecision(scenarioId: string): Promise<ApiDecisionTrace> {
  const res = await fetch('/api/route-decisions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId }),
  })
  await requireOk(res)
  return res.json()
}

export async function fetchExplanation(traceId: string): Promise<ApiExplanationResponse> {
  const res = await fetch('/api/explanations/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ traceId }),
  })
  await requireOk(res)
  return res.json()
}

export async function authorisePayment(traceId: string): Promise<ApiPaymentSnapshot> {
  const res = await fetch(`/api/payments/${traceId}/authorise`, { method: 'POST' })
  await requireOk(res)
  return res.json()
}

export async function simulateNext(traceId: string): Promise<ApiPaymentSnapshot> {
  const res = await fetch(`/api/payments/${traceId}/simulate/next`, { method: 'POST' })
  await requireOk(res)
  return res.json()
}

export async function simulateDegradation(traceId: string): Promise<ApiPaymentSnapshot> {
  const res = await fetch(`/api/payments/${traceId}/simulate/degradation`, { method: 'POST' })
  await requireOk(res)
  return res.json()
}

export async function getPaymentState(traceId: string): Promise<ApiPaymentSnapshot> {
  const res = await fetch(`/api/payments/${traceId}/state`)
  await requireOk(res)
  return res.json()
}

export async function classifyIntent(text: string): Promise<ApiIntentClassificationResponse> {
  const res = await fetch('/api/intent/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  await requireOk(res)
  return res.json()
}
