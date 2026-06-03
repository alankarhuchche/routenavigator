import { MapContainer, Polyline, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import type { DecisionTrace, RouteCandidate } from '../types'

const routeColors: Record<RouteCandidate['status'], string> = {
  SELECTED: '#0f766e',
  AVAILABLE: '#2563eb',
  EXCLUDED: '#b91c1c',
}

export function LeafletRouteMap({ trace }: { trace: DecisionTrace }) {
  return (
    <section className="panel map-panel">
      <MapContainer center={[47.5, -28]} zoom={3} scrollWheelZoom={false} className="route-map">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trace.candidates.map((candidate) => (
          <Polyline
            key={candidate.id}
            positions={candidate.coordinates}
            pathOptions={{
              color: routeColors[candidate.status],
              weight: candidate.status === 'SELECTED' ? 5 : 3,
              opacity: candidate.status === 'EXCLUDED' ? 0.45 : 0.82,
              dashArray: candidate.status === 'EXCLUDED' ? '8 8' : undefined,
            }}
          >
            <Tooltip sticky>{candidate.label}</Tooltip>
          </Polyline>
        ))}
        {trace.selectedRoute.coordinates.map((position, index) => (
          <CircleMarker
            key={`${trace.selectedRoute.id}-${index}`}
            center={position}
            radius={7}
            pathOptions={{ color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 0.9 }}
          />
        ))}
      </MapContainer>
      <div className="map-legend">
        <span><i className="legend selected" />Selected</span>
        <span><i className="legend available" />Available</span>
        <span><i className="legend excluded" />Excluded</span>
      </div>
    </section>
  )
}
