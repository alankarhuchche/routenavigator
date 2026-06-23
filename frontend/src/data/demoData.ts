import type { DemoScenario, RouteCandidate } from '../types'

const london: [number, number] = [51.5074, -0.1278]
const manchester: [number, number] = [53.4808, -2.2426]
const newYork: [number, number] = [40.7128, -74.006]
const chicago: [number, number] = [41.8781, -87.6298]
const dublin: [number, number] = [53.3498, -6.2603]
const tokenHub: [number, number] = [50.1109, 8.6821]
const dubai: [number, number] = [25.2048, 55.2708]
const mumbai: [number, number] = [19.0760, 72.8777]
const singapore: [number, number] = [1.3521, 103.8198]
const shanghai: [number, number] = [31.2304, 121.4737]
const amsterdam: [number, number] = [52.3676, 4.9041]
const sydney: [number, number] = [-33.8688, 151.2093]

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

const staticCorridorDemo = {
  executionMode: 'STATIC_DEMO' as const,
  executionLabel: 'Illustrative corridor demo',
  executionNote: 'Static frontend scenario; backend corridor route support is deferred.',
}

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
    name: 'Mid-payment route failure',
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
      {
        degradedRouteId: 'route-stablecoin-bridge-fiat-payout',
        activeRouteId: 'route-correspondent-banking',
        activeRouteLabel: 'International bank transfer',
        trigger: 'US payout partner unavailable before token transfer commitment',
        pointOfNoReturnReached: false,
        state: 'FALLBACK_SELECTED',
        message: 'Fallback selected before point-of-no-return; original decision retained and execution continues on International bank transfer.',
      },
    ),
  },
  {
    id: 'SCN-007',
    name: 'GBP to India (INR)',
    ...staticCorridorDemo,
    intent: {
      amount: 'GBP 5,000',
      source: 'GB bank account',
      destination: 'Indian beneficiary bank (INR)',
      objective: 'FASTEST',
      trackingRequired: true,
      digitalRoutesAllowed: false,
      constraints: ['RBI FEMA compliance required', 'Purpose code mandatory', 'Digital routes ineligible for this corridor'],
    },
    trace: buildTrace(
      'trace-demo-007',
      route(
        'route-correspondent-banking-india',
        'SWIFT correspondent banking',
        'CORRESPONDENT_BANKING',
        'SELECTED',
        '1-2 days',
        'Medium',
        78,
        ['Only compliant route for GBP-to-INR under RBI FEMA regulations.'],
        [london, dubai, mumbai],
      ),
      [
        route('route-stablecoin-bridge-india', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'EXCLUDED', '38 min', 'Medium', undefined, ['Stablecoin payout to Indian bank accounts not permitted under current RBI guidelines.'], [london, tokenHub, mumbai]),
        route('route-local-payout-india', 'Local payout route', 'LOCAL_PAYOUT_PARTNER', 'EXCLUDED', '4 hr', 'Low', undefined, ['No eligible local payout partner for INR corridor at this time.'], [london, dubai, mumbai]),
      ],
      'SWIFT payment instruction released with mandatory RBI purpose code attached.',
      'Beneficiary usable value only after Indian beneficiary bank credits the INR account.',
      'No pre-PONR fallback; investigation route applies if SWIFT instruction is rejected.',
    ),
  },
  {
    id: 'SCN-008',
    name: 'GBP to China (CNY)',
    ...staticCorridorDemo,
    intent: {
      amount: 'GBP 20,000',
      source: 'GB bank account',
      destination: 'Chinese beneficiary bank (CNY)',
      objective: 'MOST_TRANSPARENT',
      trackingRequired: true,
      digitalRoutesAllowed: false,
      constraints: ['SAFE registration required', 'Capital control compliance', 'Digital routes ineligible for this corridor'],
    },
    trace: buildTrace(
      'trace-demo-008',
      route(
        'route-correspondent-banking-china',
        'SWIFT correspondent banking',
        'CORRESPONDENT_BANKING',
        'SELECTED',
        '2-3 days',
        'Medium',
        72,
        ['Only compliant route for GBP-to-CNY given Chinese capital control requirements.'],
        [london, singapore, shanghai],
      ),
      [
        route('route-stablecoin-bridge-china', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'EXCLUDED', '38 min', 'Medium', undefined, ['Cross-border stablecoin payments not permitted under PBOC regulations.'], [london, tokenHub, shanghai]),
        route('route-local-payout-china', 'Local payout route', 'LOCAL_PAYOUT_PARTNER', 'EXCLUDED', '4 hr', 'Low', undefined, ['No eligible local payout partner holds PBOC cross-border licence for this value.'], [london, singapore, shanghai]),
      ],
      'SWIFT payment instruction released with SAFE registration reference attached.',
      'Beneficiary usable value only after Chinese beneficiary bank credits the CNY account.',
      'No pre-PONR fallback; SAFE compliance review required if instruction is rejected.',
    ),
  },
  {
    id: 'SCN-009',
    name: 'GBP to EU (EUR)',
    ...staticCorridorDemo,
    intent: {
      amount: 'GBP 3,000',
      source: 'GB bank account',
      destination: 'EU beneficiary bank (EUR)',
      objective: 'FASTEST',
      trackingRequired: true,
      digitalRoutesAllowed: true,
      constraints: ['Post-Brexit SEPA access via correspondent', 'Tracking required'],
    },
    trace: buildTrace(
      'trace-demo-009',
      route(
        'route-local-payout-eu',
        'SEPA credit transfer',
        'LOCAL_PAYOUT_PARTNER',
        'SELECTED',
        '4 hr',
        'Low',
        85,
        ['Fastest and cheapest compliant route for GBP-to-EUR via SEPA-connected correspondent.'],
        [london, amsterdam],
      ),
      [
        route('route-correspondent-banking-eu', 'International bank transfer', 'CORRESPONDENT_BANKING', 'AVAILABLE', '1-2 days', 'Medium', 61, ['Passed all gates but slower and more expensive than SEPA payout route.'], [london, dublin, amsterdam]),
        route('route-stablecoin-bridge-eu', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'EXCLUDED', '38 min', 'Medium', undefined, ['EUR payout via stablecoin bridge not supported for this beneficiary type.'], [london, tokenHub, amsterdam]),
      ],
      'SEPA credit transfer instruction accepted by the simulated payout partner.',
      'Beneficiary usable value after SEPA credit settlement in EUR account.',
      'International bank transfer available as fallback if SEPA partner is unavailable.',
    ),
  },
  {
    id: 'SCN-010',
    name: 'GBP to Australia (AUD)',
    ...staticCorridorDemo,
    intent: {
      amount: 'GBP 8,000',
      source: 'GB bank account',
      destination: 'Australian beneficiary bank (AUD)',
      objective: 'FASTEST',
      trackingRequired: true,
      digitalRoutesAllowed: true,
      constraints: ['Tracking required', 'Digital routes allowed'],
    },
    trace: buildTrace(
      'trace-demo-010',
      route(
        'route-local-payout-au',
        'NPP local payout',
        'LOCAL_PAYOUT_PARTNER',
        'SELECTED',
        '2-4 hr',
        'Low',
        81,
        ['Australian NPP (New Payments Platform) via local payout partner offers fastest delivery.'],
        [london, singapore, sydney],
      ),
      [
        route('route-correspondent-banking-au', 'International bank transfer', 'CORRESPONDENT_BANKING', 'AVAILABLE', '1-2 days', 'Medium', 58, ['Passed gates but SWIFT settlement is significantly slower than NPP.'], [london, singapore, sydney]),
        route('route-stablecoin-bridge-au', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'EXCLUDED', '38 min', 'Medium', undefined, ['AUD stablecoin redemption not available for this corridor.'], [london, tokenHub, sydney]),
      ],
      'NPP payment instruction accepted by the simulated Australian payout partner.',
      'Beneficiary usable value after NPP credit to Australian bank account.',
      'International bank transfer is the fallback if NPP partner is unavailable.',
    ),
  },
  {
    id: 'SCN-011',
    name: 'GBP to UAE (AED)',
    ...staticCorridorDemo,
    intent: {
      amount: 'GBP 15,000',
      source: 'GB bank account',
      destination: 'UAE beneficiary bank (AED)',
      objective: 'FASTEST',
      trackingRequired: true,
      digitalRoutesAllowed: false,
      constraints: ['CBUAE compliance required', 'Digital routes ineligible for this value band'],
    },
    trace: buildTrace(
      'trace-demo-011',
      route(
        'route-correspondent-banking-uae',
        'SWIFT correspondent banking',
        'CORRESPONDENT_BANKING',
        'SELECTED',
        '1 day',
        'Medium',
        74,
        ['Most reliable compliant route for GBP-to-AED; UAE is a major SWIFT corridor with good correspondent coverage.'],
        [london, dubai],
      ),
      [
        route('route-local-payout-uae', 'Local payout route', 'LOCAL_PAYOUT_PARTNER', 'AVAILABLE', '4 hr', 'Low', 68, ['Passed gates but local partner not eligible above GBP 10,000 for this customer tier.'], [london, dubai]),
        route('route-stablecoin-bridge-uae', 'Fast digital-dollar route', 'STABLECOIN_BRIDGE_FIAT_PAYOUT', 'EXCLUDED', '38 min', 'Medium', undefined, ['CBUAE virtual asset regulations restrict stablecoin cross-border payout for this value.'], [london, tokenHub, dubai]),
      ],
      'SWIFT payment instruction released to UAE correspondent with CBUAE-compliant purpose code.',
      'Beneficiary usable value after UAE beneficiary bank credits the AED account.',
      'No pre-PONR fallback at this value; compliance review applies if instruction is returned.',
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
  fallbackEvent?: DemoScenario['trace']['fallbackEvent'],
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
    events: [
      'Payment intent confirmed',
      'Blocking gates evaluated',
      'Route selected',
      ...(fallbackEvent ? ['Route degradation detected', fallbackEvent.message] : []),
      'Awaiting simulated authorisation',
    ],
    fallbackEvent,
  }
}
