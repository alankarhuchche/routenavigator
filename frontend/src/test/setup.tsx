/// <reference types="vitest/globals" />
import '@testing-library/jest-dom'
import React from 'react'

// Leaflet uses browser APIs not available in jsdom
vi.mock('react-leaflet', () => ({
  MapContainer: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode
    className?: string
    'aria-label'?: string
  }) => (
    <div data-testid="map" className={className} aria-label={props['aria-label']}>
      {children}
    </div>
  ),
  TileLayer: () => null,
  Polyline: () => null,
  CircleMarker: () => null,
  Tooltip: () => null,
  useMap: () => ({ invalidateSize: vi.fn() }),
}))
