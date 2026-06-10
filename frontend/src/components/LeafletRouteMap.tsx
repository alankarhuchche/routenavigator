import { MapContainer, Polyline, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import type { Polyline as LeafletPolyline } from 'leaflet'
import type { DecisionTrace, RouteCandidate } from '../types'

const routeColors: Record<RouteCandidate['status'], string> = {
  SELECTED: '#0f766e',
  AVAILABLE: '#2563eb',
  EXCLUDED: '#b91c1c',
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
  return (
    <Polyline
      positions={candidate.coordinates}
      pathOptions={{
        color: routeColors[candidate.status],
        weight: isSelected ? 5 : 3,
        opacity: candidate.status === 'EXCLUDED' ? 0.45 : 0.82,
        dashArray: candidate.status === 'EXCLUDED' ? '8 8' : isSelected ? '12 10' : undefined,
      }}
      eventHandlers={isSelected ? {
        add: (e) => {
          const el = (e.target as LeafletPolyline).getElement()
          if (el) el.classList.add('route-flow-selected')
        }
      } : undefined}
    >
      <Tooltip sticky>{candidate.label} — {candidate.eta}</Tooltip>
    </Polyline>
  )
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

  return (
    <section className="panel map-panel">
      <MapContainer key={trace.selectedRoute.id} center={centre} zoom={3} scrollWheelZoom={false} className="route-map">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trace.candidates.map((candidate) => (
          <AnimatedPolyline key={candidate.id} candidate={candidate} />
        ))}
        {trace.selectedRoute.coordinates.map((position, index, all) => {
          const name = cityName(position)
          const isEndpoint = index === 0 || index === all.length - 1
          return (
            <CircleMarker
              key={`${trace.selectedRoute.id}-${index}`}
              center={position}
              radius={isEndpoint ? 8 : 6}
              pathOptions={{ color: '#0f766e', fillColor: isEndpoint ? '#0f766e' : '#14b8a6', fillOpacity: 0.9 }}
            >
              {name && (
                <Tooltip
                  permanent={isEndpoint}
                  direction="top"
                  offset={[0, -8]}
                  className="city-label"
                >
                  {index === 0 ? `${name} · origin` : index === all.length - 1 ? `${name} · beneficiary` : name}
                </Tooltip>
              )}
            </CircleMarker>
          )
        })}
      </MapContainer>
      <div className="map-legend">
        <span><i className="legend selected" />Selected</span>
        <span><i className="legend available" />Available</span>
        <span><i className="legend excluded" />Excluded</span>
      </div>
    </section>
  )
}
