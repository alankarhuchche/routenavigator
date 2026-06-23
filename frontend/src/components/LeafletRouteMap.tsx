import { useMemo, useState } from 'react'
import { MapContainer, Polyline, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import type { Polyline as LeafletPolyline } from 'leaflet'
import { BadgeCheck, Ban, Landmark, ShieldCheck } from 'lucide-react'
import type { DecisionTrace, RouteCandidate } from '../types'
import { buildPaymentJourney, getJourneyNodeDetails } from '../paymentJourneyAdapter'

const routeColors: Record<RouteCandidate['status'], string> = {
  SELECTED: '#0f766e',
  AVAILABLE: '#64748b',
  EXCLUDED: '#94a3b8',
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

export function LeafletRouteMap({ trace }: { trace: DecisionTrace }) {
  // Compute the centre and zoom from the selected route's coordinates so the
  // map re-frames whenever the trace changes (MapContainer ignores center/zoom
  // prop updates after mount, so we key by trace id to force a full remount).
  const journey = useMemo(() => buildPaymentJourney(trace), [trace])
  const journeyNodes = journey.nodes
  const alternative = journey.alternativeRoute
  const [selectedNodeId, setSelectedNodeId] = useState(journeyNodes[0]?.id ?? 'customer')
  const selectedNode = getJourneyNodeDetails(journeyNodes, selectedNodeId)

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
          <MapContainer key={trace.selectedRoute.id} center={journey.centre} zoom={3} scrollWheelZoom={false} className="route-map">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {journey.routePaths.map((candidate) => (
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
            {journey.cityMarkers.map((marker) => {
              return (
                <CircleMarker
                  key={marker.key}
                  center={marker.position}
                  radius={marker.isEndpoint ? 4 : 3}
                  pathOptions={{ color: '#0f766e', fillColor: '#ffffff', fillOpacity: 0.88, weight: 2 }}
                >
                  {marker.name && !marker.isEndpoint && (
                    <Tooltip sticky>{marker.name}</Tooltip>
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
        {journey.timelineLabels.map((label, index) => (
          <li key={label} className={index < 3 ? 'assessed' : ''}>
            <span>{index + 1}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>
    </section>
  )
}
