import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../store/theme';

/**
 * Pick-a-point map for office locations: click anywhere (or drag the pin) and
 * the coordinates flow back through `onPick` into the form inputs; type
 * coordinates into the inputs and the map pans to them. The translucent circle
 * previews the geofence radius live, so admins SEE the check-in boundary
 * instead of guessing what "400 meters" covers.
 *
 * Free CARTO/OSM tiles — same basemap as the live office map, no API key.
 */

const TILES = {
  light: { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: '&copy; OpenStreetMap &copy; CARTO' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; OpenStreetMap &copy; CARTO' },
};

// Jakarta — a sensible starting view for an unset office; the admin's first
// click replaces it, so the exact default barely matters.
const FALLBACK_CENTER: [number, number] = [-6.2088, 106.8456];

/** ~11cm precision — more decimals are GPS noise pretending to be data. */
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

/** Zoom that comfortably shows the whole geofence circle. */
function zoomForRadius(r: number): number {
  if (r <= 150) return 17;
  if (r <= 350) return 16;
  if (r <= 800) return 15;
  if (r <= 2000) return 14;
  return 12;
}

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:26px;height:36px">
    <svg viewBox="0 0 26 36" width="26" height="36" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9.7 13 23 13 23s13-13.3 13-23C26 5.8 20.2 0 13 0z" fill="hsl(256 50% 55%)"/>
      <circle cx="13" cy="13" r="5.5" fill="#fff"/>
    </svg>
  </div>`,
  iconSize: [26, 36],
  iconAnchor: [13, 36],
});

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(round6(e.latlng.lat), round6(e.latlng.lng)) });
  return null;
}

/** Follows externally-typed coordinates. Panning to where the pin already is
 *  (after a drag) is a no-op visually, so no origin tracking is needed. */
function FollowCoords({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

/** Modals mount the map inside a container that is still animating open —
 *  Leaflet measures it too early and renders a half-blank map. One deferred
 *  invalidate fixes it. */
function FixSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export function LocationPickerMap({
  latitude,
  longitude,
  radiusMeters,
  onPick,
  height = 260,
}: {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  radiusMeters?: number | null;
  onPick: (lat: number, lng: number) => void;
  height?: number;
}) {
  const { theme } = useTheme();
  const tiles = theme === 'dark' ? TILES.dark : TILES.light;
  const hasPoint = latitude != null && longitude != null && !(latitude === 0 && longitude === 0);
  const center: [number, number] = hasPoint ? [latitude!, longitude!] : FALLBACK_CENTER;
  const radius = radiusMeters && radiusMeters > 0 ? radiusMeters : 0;
  // Initial zoom only — reactive zoom would fight the user's scroll wheel.
  const initialZoom = useRef(zoomForRadius(radius || 300));

  return (
    <div className="relative overflow-hidden rounded-lg border border-border" style={{ height }}>
      {!hasPoint && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-card backdrop-blur">
          Click the map to drop the office pin
        </div>
      )}
      <MapContainer center={center} zoom={initialZoom.current} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer url={tiles.url} attribution={tiles.attribution} />
        <FixSize />
        <ClickToPlace onPick={onPick} />
        {hasPoint && (
          <>
            <FollowCoords lat={latitude!} lng={longitude!} />
            {radius > 0 && (
              <Circle
                center={[latitude!, longitude!]}
                radius={radius}
                pathOptions={{ color: 'hsl(256 50% 55%)', fillColor: 'hsl(256 50% 55%)', fillOpacity: 0.12, weight: 1.5 }}
              />
            )}
            <Marker
              position={[latitude!, longitude!]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const p = (e.target as L.Marker).getLatLng();
                  onPick(round6(p.lat), round6(p.lng));
                },
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
