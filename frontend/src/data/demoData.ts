import type { DemoScenario, RouteCandidate } from '../types'

const london: [number, number] = [51.5074, -0.1278]
const manchester: [number, number] = [53.4808, -2.2426]
const newYork: [number, number] = [40.7128, -74.006]
const chicago: [number, number] = [41.8781, -87.6298]
const dublin: [number, number] = [53.3498, -6.2603]
const tokenHub: [number, number] = [50.1109, 8.6821]

function route(
  id: string,
  label: string,
  family: string,
  status: RouteCandidate['status'],
  eta: string,
  cost: string,
  score: number | undefined,
  reasons: string[],
  coordinates: [number, number][],
): RouteCandidate {
  return { id, label, family, status, eta, cost, score, reasons, coordinates }
}

const baseAiBoundary =
  'Gemini explains a redacted Decision Trace only. Deterministic services select, score and simulate routes.'

export const demoScenarios: DemoScenario[] = [
  {
    id: 'SCN-001',
    name: 'UK instant payment',
    intent: {
      amount: 'GBP 500',
      source: 'GB bank account',
      destination: 'UK beneficiary bank',
      objective: 'FASTEST',
      trackingRequired: false,
      digitalRoutesAllowed: false,
      constraints: ['Domestic GBP payment'],
    },
    trace: buildTrace(
      'trace-demo-001',
      route(
        'route-uk-instant-bank-transfer',
        'Instant UK bank transfer',
        'UK_DOMESTIC_INSTANT',
        'SELECTED',
        '2 min',
        'Low',
        94,
        ['Fastest usable value for eligible domestic GBP transfer.'],
        [london, manchester],
      ),
      [
        route('route-correspondent-banking', 'International bank transfer', 'CORRESPONDENT_BANKING', 'EXCLUDED', '1-2 days', 'Medium', undefined, ['Not needed for domestic GBP payment.'], [london, dublin, manchester]),
        route('route-stablecoin-bridge-fiat-payout', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'EXCLUDED', '38 min', 'Medium', undefined, ['Digital route not allowed for this scenario.'], [london, tokenHub, manchester]),
      ],
      'Domestic rail instruction accepted by the simulated bank transfer service.',
      'Beneficiary usable value after simulated bank credit confirmation.',
      'No fallback candidate needed for this simple domestic scenario.',
    ),
  },
  {
    id: 'SCN-002',
    name: 'USD to US fastest',
    intent: {
      amount: 'USD 10,000 from GBP',
      source: 'GB bank account',
      destination: 'US beneficiary bank',
      objective: 'FASTEST',
      trackingRequired: true,
      digitalRoutesAllowed: true,
      constraints: ['Tracking required', 'Digital routes allowed'],
    },
    trace: buildTrace(
      'trace-demo-002',
      route(
        'route-stablecoin-bridge-fiat-payout',
        'Fast digital-dollar route',
        'STABLECOIN_BRIDGE_FIAT_PAYOUT',
        'SELECTED',
        '38 min',
        'Medium',
        83.6,
        ['Fastest estimated time to beneficiary usable value after gates pass.'],
        [london, tokenHub, newYork],
      ),
      [
        route('route-local-payout-partner', 'Local payout route', 'LOCAL_PAYOUT_PARTNER', 'AVAILABLE', '4 hr', 'Low', 67.5, ['Passed gates but slower for the FASTEST objective.'], [london, dublin, newYork]),
        route('route-correspondent-banking', 'International bank transfer', 'CORRESPONDENT_BANKING', 'AVAILABLE', '1-2 days', 'Medium', 55.5, ['Passed gates but lower speed score.'], [london, dublin, chicago, newYork]),
        route('route-wallet-to-wallet-stablecoin', 'Digital-dollar wallet transfer', 'WALLET_TO_WALLET_STABLECOIN', 'EXCLUDED', '3 min', 'Low', undefined, ['Beneficiary endpoint is a bank account, not a wallet.'], [london, tokenHub, newYork]),
      ],
      'Token transfer commitment after wallet screening and before redemption.',
      'Not complete until beneficiary usable fiat value is confirmed.',
      'International bank transfer remains the pre-PONR fallback candidate.',
    ),
  },
  {
    id: 'SCN-003',
    name: 'USDC wallet-to-wallet',
    intent: {
      amount: '10,000 USDC',
      source: 'Source wallet',
      destination: 'Beneficiary wallet',
      objective: 'FASTEST',
      trackingRequired: true,
      digitalRoutesAllowed: true,
      constraints: ['Wallet-to-wallet stablecoin transfer'],
    },
    trace: buildTrace(
      'trace-demo-003',
      route('route-wallet-to-wallet-stablecoin', 'Digital-dollar wallet transfer', 'WALLET_TO_WALLET_STABLECOIN', 'SELECTED', '3 min', 'Low', 91.9, ['Source asset and endpoint match wallet-to-wallet route.'], [london, tokenHub, newYork]),
      [
        route('route-stablecoin-bridge-fiat-payout', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'EXCLUDED', '38 min', 'Medium', undefined, ['No fiat payout is required.'], [london, tokenHub, newYork]),
        route('route-correspondent-banking', 'International bank transfer', 'CORRESPONDENT_BANKING', 'EXCLUDED', '1-2 days', 'Medium', undefined, ['Destination is not a bank account.'], [london, dublin, newYork]),
      ],
      'Token transfer submitted to the simulated network.',
      'Beneficiary usable value after wallet balance confirmation.',
      'No bank-transfer fallback for a wallet-only customer request.',
    ),
  },
  {
    id: 'SCN-004',
    name: 'USD cheapest',
    intent: {
      amount: 'USD 1,000 from GBP',
      source: 'GB bank account',
      destination: 'US beneficiary bank',
      objective: 'CHEAPEST',
      trackingRequired: false,
      digitalRoutesAllowed: true,
      constraints: ['Lowest cost'],
    },
    trace: buildTrace(
      'trace-demo-004',
      route('route-local-payout-partner', 'Local payout route', 'LOCAL_PAYOUT_PARTNER', 'SELECTED', '4 hr', 'Low', 80.75, ['Lowest illustrative cost after FX and partner fee.'], [london, dublin, newYork]),
      [
        route('route-stablecoin-bridge-fiat-payout', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'AVAILABLE', '38 min', 'Medium', 76.9, ['Faster but higher illustrative cost.'], [london, tokenHub, newYork]),
        route('route-correspondent-banking', 'International bank transfer', 'CORRESPONDENT_BANKING', 'AVAILABLE', '1-2 days', 'Medium', 63, ['Passed gates but cost and speed are weaker.'], [london, dublin, chicago, newYork]),
      ],
      'Local payout partner accepts payout instruction.',
      'Beneficiary usable value after simulated local payout settlement.',
      'International bank transfer remains a slower fallback candidate.',
    ),
  },
  {
    id: 'SCN-005',
    name: 'Traditional bank transfer only',
    intent: {
      amount: 'USD 10,000 from GBP',
      source: 'GB bank account',
      destination: 'US beneficiary bank',
      objective: 'MOST_TRANSPARENT',
      trackingRequired: true,
      digitalRoutesAllowed: false,
      constraints: ['Traditional bank transfer only'],
    },
    trace: buildTrace(
      'trace-demo-005',
      route('route-correspondent-banking', 'International bank transfer', 'CORRESPONDENT_BANKING', 'SELECTED', '1-2 days', 'Medium', 77.5, ['Customer constraint excludes digital and partner-payout routes.'], [london, dublin, chicago, newYork]),
      [
        route('route-stablecoin-bridge-fiat-payout', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'EXCLUDED', '38 min', 'Medium', undefined, ['Excluded by traditional-only customer constraint.'], [london, tokenHub, newYork]),
        route('route-local-payout-partner', 'Local payout route', 'LOCAL_PAYOUT_PARTNER', 'EXCLUDED', '4 hr', 'Low', undefined, ['Excluded by traditional-only customer constraint.'], [london, dublin, newYork]),
      ],
      'Correspondent banking payment instruction released to the simulated message layer.',
      'Beneficiary usable value only after beneficiary bank credit confirmation.',
      'No fallback beyond servicing or investigation once PONR is reached.',
    ),
  },
  {
    id: 'SCN-006',
    name: 'Fallback before PONR',
    intent: {
      amount: 'USD 10,000 from GBP',
      source: 'GB bank account',
      destination: 'US beneficiary bank',
      objective: 'FASTEST',
      trackingRequired: true,
      digitalRoutesAllowed: true,
      constraints: ['Simulate payout partner degradation before PONR'],
    },
    trace: buildTrace(
      'trace-demo-006',
      route('route-stablecoin-bridge-fiat-payout', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'SELECTED', '38 min', 'Medium', 83.6, ['Initial route wins before simulated degradation.'], [london, tokenHub, newYork]),
      [
        route('route-correspondent-banking', 'International bank transfer', 'CORRESPONDENT_BANKING', 'AVAILABLE', '1-2 days', 'Medium', 55.5, ['Selected as fallback because PONR has not been reached.'], [london, dublin, chicago, newYork]),
        route('route-local-payout-partner', 'Local payout route', 'LOCAL_PAYOUT_PARTNER', 'AVAILABLE', '4 hr', 'Low', 67.5, ['Passed gates but fallback policy prefers bank-transfer continuity.'], [london, dublin, newYork]),
      ],
      'Token transfer commitment after wallet screening and before redemption.',
      'Not complete until beneficiary usable fiat value is confirmed.',
      'Fallback to International bank transfer before point-of-no-return.',
    ),
  },
]

function buildTrace(
  traceId: string,
  selectedRoute: RouteCandidate,
  otherCandidates: RouteCandidate[],
  pointOfNoReturn: string,
  finality: string,
  fallback: string,
) {
  const candidates = [selectedRoute, ...otherCandidates]
  return {
    traceId,
    selectedRoute,
    candidates,
    gates: candidates.flatMap((candidate) => [
      {
        routeLabel: candidate.label,
        gate: 'Universal hard gates',
        result: candidate.status === 'EXCLUDED' ? 'EXCLUDED' as const : 'PASS' as const,
        reason: candidate.status === 'EXCLUDED' ? candidate.reasons[0] : 'Compliance, liquidity, reachability and route health passed.',
      },
      {
        routeLabel: candidate.label,
        gate: 'Route-specific gates',
        result: candidate.status === 'EXCLUDED' ? 'EXCLUDED' as const : 'PASS' as const,
        reason: candidate.status === 'EXCLUDED' ? candidate.reasons[0] : 'Route-specific eligibility passed.',
      },
    ]),
    scoreDimensions: {
      speed: selectedRoute.score ?? 0,
      cost: Math.max(40, (selectedRoute.score ?? 0) - 8),
      certainty: Math.max(45, (selectedRoute.score ?? 0) - 12),
      transparency: Math.max(50, (selectedRoute.score ?? 0) - 6),
    },
    pointOfNoReturn,
    finality,
    fallback,
    aiBoundary: baseAiBoundary,
    explanation: `${selectedRoute.label} is selected because it best satisfies the objective after blocking gates pass. Excluded routes remain visible with hard-gate reasons.`,
  }
}
