import type { DecisionTrace, RouteCandidate } from './types'

export type JourneyNodeKind = 'party' | 'control' | 'settlement'

export interface JourneyNode {
  id: string
  name: string
  role: string
  status: string
  customerMeaning: string
  expertNote: string
  kind: JourneyNodeKind
  coordinate: [number, number]
  sequence: number
}

export interface JourneyCityMarker {
  key: string
  position: [number, number]
  name: string | null
  isEndpoint: boolean
}

export interface PaymentJourney {
  centre: [number, number]
  nodes: JourneyNode[]
  routePaths: RouteCandidate[]
  alternativeRoute?: RouteCandidate
  timelineLabels: string[]
  cityMarkers: JourneyCityMarker[]
}

type JourneyNodeTemplate = [
  id: string,
  name: string,
  role: string,
  status: string,
  customerMeaning: string,
  expertNote: string,
  kind: JourneyNodeKind,
]

const CITY_NAMES: [number, number, string][] = [
  [51.5074, -0.1278, 'London'],
  [53.4808, -2.2426, 'Manchester'],
  [40.7128, -74.006, 'New York'],
  [41.8781, -87.6298, 'Chicago'],
  [53.3498, -6.2603, 'Dublin'],
  [50.1109, 8.6821, 'Frankfurt token hub'],
  [25.2048, 55.2708, 'Dubai'],
  [19.076, 72.8777, 'Mumbai'],
  [1.3521, 103.8198, 'Singapore'],
  [31.2304, 121.4737, 'Shanghai'],
  [52.3676, 4.9041, 'Amsterdam'],
  [-33.8688, 151.2093, 'Sydney'],
]

const TIMELINE_LABELS = [
  'Created',
  'Validated',
  'FX/cut-off checked',
  'Released',
  'Finality boundary',
  'Beneficiary credited',
]

function cityName(position: [number, number]): string | null {
  const match = CITY_NAMES.find(
    ([lat, lng]) => Math.abs(lat - position[0]) < 0.01 && Math.abs(lng - position[1]) < 0.01,
  )
  return match ? match[2] : null
}

function interpolateCoordinate(coordinates: [number, number][], progress: number): [number, number] {
  if (coordinates.length === 0) return [47.5, -28]
  if (coordinates.length === 1) return coordinates[0]

  const scaled = progress * (coordinates.length - 1)
  const startIndex = Math.floor(scaled)
  const endIndex = Math.min(coordinates.length - 1, startIndex + 1)
  const segmentProgress = scaled - startIndex
  const start = coordinates[startIndex]
  const end = coordinates[endIndex]

  return [
    start[0] + (end[0] - start[0]) * segmentProgress,
    start[1] + (end[1] - start[1]) * segmentProgress,
  ]
}

function routeKind(trace: DecisionTrace) {
  const family = trace.selectedRoute.family
  const label = trace.selectedRoute.label.toLowerCase()

  return {
    isDomestic: family.includes('DOMESTIC'),
    isDigital: family.includes('STABLECOIN') || family.includes('WALLET') || label.includes('digital'),
    isTokenised: family.includes('TOKEN'),
  }
}

function domesticTemplates(): JourneyNodeTemplate[] {
  return [
    ['customer', 'Customer', 'Payment originator', 'Intent confirmed', 'Your payment outcome has been structured for the route engine.', 'Identity and session context are assessed before route analysis.', 'party'],
    ['sending-bank', 'Sending bank', 'Bank-owned orchestration', 'Control checkpoint', 'The bank evaluates whether the payment can be safely routed.', 'Fraud, sanctions, eligibility and route policy are assessed in the route decision.', 'control'],
    ['scheme', 'Domestic scheme', 'Domestic clearing rail', 'Assessed in route decision', 'The recommended domestic rail is checked for availability.', 'Scheme availability and cut-off assumptions are represented with demo-safe data.', 'control'],
    ['beneficiary-bank', 'Beneficiary bank', 'Receiving bank', 'Beneficiary verified', 'The beneficiary bank is checked as the receiving endpoint.', 'Beneficiary reachability is assessed before recommendation.', 'party'],
    ['beneficiary-credit', 'Beneficiary credit', 'Customer outcome', 'Finality boundary', 'This is when the beneficiary can use the funds.', 'Customer receipt may occur after technical settlement depending on route type.', 'settlement'],
  ]
}

function digitalTemplates(isTokenised: boolean): JourneyNodeTemplate[] {
  return [
    ['customer', 'Customer', 'Payment originator', 'Intent confirmed', 'Your payment outcome has been confirmed. No money has moved yet.', 'Identity/session and scoped consent were verified before route recommendation.', 'party'],
    ['sending-bank', 'Sending bank', 'Bank-owned orchestration', 'Control checkpoint', 'The bank checks whether a digital route is permitted for this intent.', 'Policy, fraud, sanctions and liquidity controls are assessed in the route decision.', 'control'],
    ['bridge', isTokenised ? 'Token network' : 'Digital bridge', 'Digital route component', 'Route health checked', 'The digital leg is assessed as part of the route recommendation.', 'Digital eligibility uses demo-safe route attributes, not live network telemetry.', 'control'],
    ['wallet-screening', 'Wallet screening', 'Eligibility checkpoint', 'Assessed in route decision', 'Wallet or payout eligibility must be suitable before recommendation.', 'Wallet, off-ramp and beneficiary endpoint controls are represented generically.', 'control'],
    ['digital-transfer', isTokenised ? 'Receiving ledger' : 'Stablecoin transfer', 'Digital value movement', 'Point of no return', 'After this point, recall may be limited.', 'Release/finality boundary depends on the selected route type. No money has moved before approval.', 'settlement'],
    ['beneficiary-credit', 'Beneficiary credit', 'Customer outcome', 'Finality boundary', 'This is when the beneficiary can use the funds.', 'Customer receipt may occur after technical settlement depending on route type.', 'settlement'],
  ]
}

function internationalTemplates(trace: DecisionTrace): JourneyNodeTemplate[] {
  return [
    ['customer', 'Customer', 'Payment originator', 'Intent confirmed', 'Your payment outcome has been confirmed. No money has moved yet.', 'Identity/session and scoped consent were verified before route recommendation.', 'party'],
    ['sending-bank', 'Sending bank', 'Bank-owned orchestration', 'Control checkpoint', 'The bank evaluates whether the payment can be safely routed.', 'Fraud, sanctions, eligibility and route policy are assessed in the route decision.', 'control'],
    ['fx', 'FX', 'Currency and cut-off checkpoint', 'FX/cut-off checked', 'Currency conversion is assessed before release.', 'FX availability and cut-off are evaluated by the route engine.', 'control'],
    ['swift', trace.selectedRoute.label.includes('SWIFT') ? 'SWIFT / rail' : 'Rail leg', 'Cross-border messaging leg', 'Assessed in route decision', 'The cross-border leg is checked for suitability and traceability.', 'Intermediary details are generic demo labels, not real correspondent bank data.', 'control'],
    ['intermediary', 'Intermediary', 'Partner or correspondent leg', 'Route health checked', 'This is where the payment may pass through a partner or correspondent leg.', 'Reachability, route health and tracking are assessed.', 'party'],
    ['local-clearing', 'Local clearing', 'Receiving market leg', 'Point of no return', 'After this point, recall may be limited.', 'Release/finality boundary depends on the selected route type.', 'settlement'],
    ['beneficiary-bank', 'Beneficiary bank', 'Receiving bank', 'Beneficiary verified', 'The beneficiary bank is checked as the receiving endpoint.', 'Beneficiary reachability is assessed before recommendation.', 'party'],
    ['beneficiary-credit', 'Beneficiary credit', 'Customer outcome', 'Finality boundary', 'This is when the beneficiary can use the funds.', 'Customer receipt may occur after technical settlement depending on route type.', 'settlement'],
  ]
}

export function buildJourneyTimeline(): string[] {
  return [...TIMELINE_LABELS]
}

export function buildJourneyNodes(trace: DecisionTrace): JourneyNode[] {
  const { isDomestic, isDigital, isTokenised } = routeKind(trace)
  const templates = isDomestic
    ? domesticTemplates()
    : isDigital
      ? digitalTemplates(isTokenised)
      : internationalTemplates(trace)

  return templates.map((template, index) => {
    const progress = templates.length === 1 ? 0 : index / (templates.length - 1)
    return {
      id: template[0],
      name: template[1],
      role: template[2],
      status: template[3],
      customerMeaning: template[4],
      expertNote: template[5],
      kind: template[6],
      coordinate: interpolateCoordinate(trace.selectedRoute.coordinates, progress),
      sequence: index + 1,
    }
  })
}

export function buildRoutePaths(trace: DecisionTrace): RouteCandidate[] {
  return trace.candidates
}

export function getJourneyNodeDetails(nodes: JourneyNode[], nodeId: string): JourneyNode | undefined {
  return nodes.find((node) => node.id === nodeId) ?? nodes[0]
}

export function selectAlternativeRoute(trace: DecisionTrace): RouteCandidate | undefined {
  return trace.candidates.find((candidate) => candidate.status === 'EXCLUDED')
    ?? trace.candidates.find((candidate) => candidate.status === 'AVAILABLE')
}

export function buildCityMarkers(trace: DecisionTrace): JourneyCityMarker[] {
  return trace.selectedRoute.coordinates.map((position, index, all) => ({
    key: `${trace.selectedRoute.id}-${index}`,
    position,
    name: cityName(position),
    isEndpoint: index === 0 || index === all.length - 1,
  }))
}

export function buildMapCentre(trace: DecisionTrace): [number, number] {
  const coordinates = trace.selectedRoute.coordinates
  return coordinates.length > 0
    ? [
        coordinates.reduce((sum, coordinate) => sum + coordinate[0], 0) / coordinates.length,
        coordinates.reduce((sum, coordinate) => sum + coordinate[1], 0) / coordinates.length,
      ]
    : [47.5, -28]
}

export function buildPaymentJourney(trace: DecisionTrace): PaymentJourney {
  return {
    centre: buildMapCentre(trace),
    nodes: buildJourneyNodes(trace),
    routePaths: buildRoutePaths(trace),
    alternativeRoute: selectAlternativeRoute(trace),
    timelineLabels: buildJourneyTimeline(),
    cityMarkers: buildCityMarkers(trace),
  }
}
