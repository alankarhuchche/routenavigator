import { useMemo, useState } from 'react'
import { MapContainer, Polyline, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import type { Polyline as LeafletPolyline } from 'leaflet'
import { BadgeCheck, Ban, Landmark, ShieldCheck } from 'lucide-react'
import type { DecisionTrace, RouteCandidate } from '../types'

const routeColors: Record<RouteCandidate['status'], string> = {
  SELECTED: '#0f766e',
  AVAILABLE: '#64748b',
  EXCLUDED: '#94a3b8',
}

const cityNames: [number, number, string][] = [
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

function cityName(position: [number, number]): string | null {
  const match = cityNames.find(
    ([lat, lng]) => Math.abs(lat - position[0]) < 0.01 && Math.abs(lng - position[1]) < 0.01,
  )
  return match ? match[2] : null
}

function AnimatedPolyline({ candidate }: { candidate: RouteCandidate }) {
  const isSelected = candidate.status === 'SELECTED'
  const routeLabel = isSelected
    ? `Recommended route: ${candidate.label}`
    : candidate.status === 'AVAILABLE'
      ? `Alternative route: ${candidate.label}`
      : `Not selected: ${candidate.label}`
  return (
    <Polyline
      positions={candidate.coordinates}
      pathOptions={{
        color: routeColors[candidate.status],
        weight: isSelected ? 7 : 2,
        opacity: isSelected ? 0.96 : candidate.status === 'AVAILABLE' ? 0.24 : 0.18,
        dashArray: isSelected ? '12 10' : candidate.status === 'AVAILABLE' ? '4 10' : '3 9',
      }}
      eventHandlers={isSelected ? {
        add: (e) => {
          const el = (e.target as LeafletPolyline).getElement()
          if (el) el.classList.add('route-flow-selected')
        }
      } : undefined}
    >
      <Tooltip sticky>{routeLabel} — {candidate.eta}</Tooltip>
    </Polyline>
  )
}

type JourneyNodeKind = 'party' | 'control' | 'settlement'

interface JourneyNode {
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

const timelineLabels = [
  'Created',
  'Validated',
  'FX/cut-off checked',
  'Released',
  'Finality boundary',
  'Beneficiary credited',
]

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

function buildJourneyNodes(trace: DecisionTrace): JourneyNode[] {
  const family = trace.selectedRoute.family
  const label = trace.selectedRoute.label.toLowerCase()
  const isDomestic = family.includes('DOMESTIC')
  const isDigital = family.includes('STABLECOIN') || family.includes('WALLET') || label.includes('digital')
  const isTokenised = family.includes('TOKEN')

  const templates = isDomestic
    ? [
        ['customer', 'Customer', 'Payment originator', 'Intent confirmed', 'Your payment outcome has been structured for the route engine.', 'Identity and session context are assessed before route analysis.', 'party'],
        ['sending-bank', 'Sending bank', 'Bank-owned orchestration', 'Control checkpoint', 'The bank evaluates whether the payment can be safely routed.', 'Fraud, sanctions, eligibility and route policy are assessed in the route decision.', 'control'],
        ['scheme', 'Domestic scheme', 'Domestic clearing rail', 'Assessed in route decision', 'The recommended domestic rail is checked for availability.', 'Scheme availability and cut-off assumptions are represented with demo-safe data.', 'control'],
        ['beneficiary-bank', 'Beneficiary bank', 'Receiving bank', 'Beneficiary verified', 'The beneficiary bank is checked as the receiving endpoint.', 'Beneficiary reachability is assessed before recommendation.', 'party'],
        ['beneficiary-credit', 'Beneficiary credit', 'Customer outcome', 'Finality boundary', 'This is when the beneficiary can use the funds.', 'Customer receipt may occur after technical settlement depending on route type.', 'settlement'],
      ]
    : isDigital
      ? [
          ['customer', 'Customer', 'Payment originator', 'Intent confirmed', 'Your payment outcome has been confirmed. No money has moved yet.', 'Identity/session and scoped consent were verified before route recommendation.', 'party'],
          ['sending-bank', 'Sending bank', 'Bank-owned orchestration', 'Control checkpoint', 'The bank checks whether a digital route is permitted for this intent.', 'Policy, fraud, sanctions and liquidity controls are assessed in the route decision.', 'control'],
          ['bridge', isTokenised ? 'Token network' : 'Digital bridge', 'Digital route component', 'Route health checked', 'The digital leg is assessed as part of the route recommendation.', 'Digital eligibility uses demo-safe route attributes, not live network telemetry.', 'control'],
          ['wallet-screening', 'Wallet screening', 'Eligibility checkpoint', 'Assessed in route decision', 'Wallet or payout eligibility must be suitable before recommendation.', 'Wallet, off-ramp and beneficiary endpoint controls are represented generically.', 'control'],
          ['digital-transfer', isTokenised ? 'Receiving ledger' : 'Stablecoin transfer', 'Digital value movement', 'Point of no return', 'After this point, recall may be limited.', 'Release/finality boundary depends on the selected route type. No money has moved before approval.', 'settlement'],
          ['beneficiary-credit', 'Beneficiary credit', 'Customer outcome', 'Finality boundary', 'This is when the beneficiary can use the funds.', 'Customer receipt may occur after technical settlement depending on route type.', 'settlement'],
        ]
      : [
          ['customer', 'Customer', 'Payment originator', 'Intent confirmed', 'Your payment outcome has been confirmed. No money has moved yet.', 'Identity/session and scoped consent were verified before route recommendation.', 'party'],
          ['sending-bank', 'Sending bank', 'Bank-owned orchestration', 'Control checkpoint', 'The bank evaluates whether the payment can be safely routed.', 'Fraud, sanctions, eligibility and route policy are assessed in the route decision.', 'control'],
          ['fx', 'FX', 'Currency and cut-off checkpoint', 'FX/cut-off checked', 'Currency conversion is assessed before release.', 'FX availability and cut-off are evaluated by the route engine.', 'control'],
          ['swift', trace.selectedRoute.label.includes('SWIFT') ? 'SWIFT / rail' : 'Rail leg', 'Cross-border messaging leg', 'Assessed in route decision', 'The cross-border leg is checked for suitability and traceability.', 'Intermediary details are generic demo labels, not real correspondent bank data.', 'control'],
          ['intermediary', 'Intermediary', 'Partner or correspondent leg', 'Route health checked', 'This is where the payment may pass through a partner or correspondent leg.', 'Reachability, route health and tracking are assessed.', 'party'],
          ['local-clearing', 'Local clearing', 'Receiving market leg', 'Point of no return', 'After this point, recall may be limited.', 'Release/finality boundary depends on the selected route type.', 'settlement'],
          ['beneficiary-bank', 'Beneficiary bank', 'Receiving bank', 'Beneficiary verified', 'The beneficiary bank is checked as the receiving endpoint.', 'Beneficiary reachability is assessed before recommendation.', 'party'],
          ['beneficiary-credit', 'Beneficiary credit', 'Customer outcome', 'Finality boundary', 'This is when the beneficiary can use the funds.', 'Customer receipt may occur after technical settlement depending on route type.', 'settlement'],
        ]

  return templates.map((template, index) => {
    const progress = templates.length === 1 ? 0 : index / (templates.length - 1)
    return {
      id: template[0] as string,
      name: template[1] as string,
      role: template[2] as string,
      status: template[3] as string,
      customerMeaning: template[4] as string,
      expertNote: template[5] as string,
      kind: template[6] as JourneyNodeKind,
      coordinate: interpolateCoordinate(trace.selectedRoute.coordinates, progress),
      sequence: index + 1,
    }
  })
}

function selectedAlternative(trace: DecisionTrace): RouteCandidate | undefined {
  return trace.candidates.find(candidate => candidate.status === 'EXCLUDED')
    ?? trace.candidates.find(candidate => candidate.status === 'AVAILABLE')
}

export function LeafletRouteMap({ trace }: { trace: DecisionTrace }) {
  // Compute the centre and zoom from the selected route's coordinates so the
  // map re-frames whenever the trace changes (MapContainer ignores center/zoom
  // prop updates after mount, so we key by trace id to force a full remount).
  const coords = trace.selectedRoute.coordinates
  const centre: [number, number] = coords.length > 0
    ? [
        coords.reduce((s, c) => s + c[0], 0) / coords.length,
        coords.reduce((s, c) => s + c[1], 0) / coords.length,
      ]
    : [47.5, -28]
  const journeyNodes = useMemo(() => buildJourneyNodes(trace), [trace])
  const alternative = selectedAlternative(trace)
  const [selectedNodeId, setSelectedNodeId] = useState(journeyNodes[0]?.id ?? 'customer')
  const selectedNode = journeyNodes.find(node => node.id === selectedNodeId) ?? journeyNodes[0]

  return (
    <section className="panel map-panel">
      <div className="panel-title map-title">
        <Landmark size={18} aria-hidden="true" />
        <div>
          <h2>Payment journey map</h2>
          <p>Representative journey based on the selected route and decision trace.</p>
        </div>
      </div>
      <div className="map-safety-line">
        Expected journey only — no money has moved. Final approval is still required.
      </div>

      <div className="payment-journey-layout">
        <div className="payment-map-wrap">
          <MapContainer key={trace.selectedRoute.id} center={centre} zoom={3} scrollWheelZoom={false} className="route-map">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {trace.candidates.map((candidate) => (
              <AnimatedPolyline key={candidate.id} candidate={candidate} />
            ))}
            {journeyNodes.map((node, index) => (
              <CircleMarker
                key={node.id}
                center={node.coordinate}
                radius={node.kind === 'settlement' ? 8 : node.kind === 'control' ? 7 : 6}
                pathOptions={{
                  color: node.id === selectedNode?.id ? '#0f766e' : node.kind === 'settlement' ? '#b45309' : '#1d4ed8',
                  fillColor: node.kind === 'settlement' ? '#f59e0b' : node.kind === 'control' ? '#3b82f6' : '#14b8a6',
                  fillOpacity: 0.9,
                  weight: node.id === selectedNode?.id ? 3 : 2,
                }}
                eventHandlers={{ click: () => setSelectedNodeId(node.id) }}
              >
                <Tooltip
                  permanent={index === 0 || index === journeyNodes.length - 1 || node.kind === 'settlement'}
                  direction="top"
                  offset={[0, -8]}
                  className="city-label"
                >
                  {node.sequence} {node.name}
                </Tooltip>
              </CircleMarker>
            ))}
            {trace.selectedRoute.coordinates.map((position, index, all) => {
              const name = cityName(position)
              const isEndpoint = index === 0 || index === all.length - 1
              return (
                <CircleMarker
                  key={`${trace.selectedRoute.id}-${index}`}
                  center={position}
                  radius={isEndpoint ? 4 : 3}
                  pathOptions={{ color: '#0f766e', fillColor: '#ffffff', fillOpacity: 0.88, weight: 2 }}
                >
                  {name && !isEndpoint && (
                    <Tooltip sticky>{name}</Tooltip>
                  )}
                </CircleMarker>
              )
            })}
          </MapContainer>
          <div className="map-legend">
            <span><i className="legend selected" />Recommended route</span>
            <span><i className="legend available" />Alternative route</span>
            <span><i className="legend excluded" />Alternative not selected</span>
            <span><i className="legend control" />Control checkpoint</span>
            <span><i className="legend settlement" />Settlement boundary</span>
          </div>
        </div>

        <aside className="journey-detail-panel" aria-label="Payment journey node detail">
          <div className="journey-detail-head">
            <BadgeCheck size={18} aria-hidden="true" />
            <div>
              <h3>{selectedNode?.name ?? 'Journey checkpoint'}</h3>
              <p>{selectedNode?.role ?? 'Route journey checkpoint'}</p>
            </div>
          </div>
          <p className="journey-select-hint">Select a node to see customer and expert context.</p>
          <dl className="journey-detail-grid">
            <div>
              <dt>Role in journey</dt>
              <dd>{selectedNode?.role ?? 'Route journey checkpoint'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{selectedNode?.status ?? 'Assessed in route decision'}</dd>
            </div>
            <div>
              <dt>Customer meaning</dt>
              <dd>{selectedNode?.customerMeaning ?? 'This checkpoint explains the expected route journey.'}</dd>
            </div>
            <div>
              <dt>Expert note</dt>
              <dd>{selectedNode?.expertNote ?? 'Demo-safe journey node derived from selected route type.'}</dd>
            </div>
          </dl>
          <div className="journey-node-list" aria-label="Journey checkpoints">
            {journeyNodes.map(node => (
              <button
                type="button"
                key={node.id}
                className={node.id === selectedNode?.id ? 'active' : ''}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <span>{node.sequence}. {node.name}</span>
                <small>{node.status}</small>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="journey-meta-row">
        <div className="alternative-route-card">
          <Ban size={16} aria-hidden="true" />
          <div>
            <strong>{alternative ? `${alternative.label} not selected` : 'Alternative route not shown'}</strong>
            <p>
              {alternative?.reasons[0] ?? 'Did not best match confirmed intent and controls.'}
            </p>
          </div>
        </div>
        <div className="journey-boundary-card">
          <ShieldCheck size={16} aria-hidden="true" />
          <div>
            <strong>Final approval required</strong>
            <p>Expected route journey only. No money moves until customer approval and simulated execution.</p>
          </div>
        </div>
      </div>

      <ol className="journey-timeline" aria-label="Expected route journey timeline">
        {timelineLabels.map((label, index) => (
          <li key={label} className={index < 3 ? 'assessed' : ''}>
            <span>{index + 1}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>
    </section>
  )
}
