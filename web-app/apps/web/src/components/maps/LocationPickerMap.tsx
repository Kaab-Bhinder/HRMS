import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * Pick-a-point map for office locations: click anywhere (or drag the pin) and
 * the coordinates flow back through `onPick` into the form inputs; type
 * coordinates into the inputs and the map pans to them. The translucent circle
 * previews the geofence radius live, so admins SEE the check-in boundary
 * instead of guessing what "400 meters" covers.
 *
 * Two free basemaps, no API key:
 *  - Streets: standard OSM tiles — full street names/detail up to zoom 19,
 *    the familiar "Google Maps" reading experience.
 *  - Satellite: Esri World Imagery — for eyeballing the actual building.
 * Plus a true browser-fullscreen toggle for precise pin placement.
 */

const LAYERS = {
  streets: {
    label: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxNativeZoom: 19,
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxNativeZoom: 19,
  },
} as const;
type LayerKey = keyof typeof LAYERS;

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [layer, setLayer] = useState<LayerKey>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasPoint = latitude != null && longitude != null && !(latitude === 0 && longitude === 0);
  const center: [number, number] = hasPoint ? [latitude!, longitude!] : FALLBACK_CENTER;
  const radius = radiusMeters && radiusMeters > 0 ? radiusMeters : 0;
  // Initial zoom only — reactive zoom would fight the user's scroll wheel.
  const initialZoom = useRef(zoomForRadius(radius || 300));
  const tiles = LAYERS[layer];

  // Track browser fullscreen (Esc also exits it) and re-measure the map for
  // the new viewport either way.
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapRef.current);
      setTimeout(() => map?.invalidateSize(), 120);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [map]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement === wrapRef.current) void document.exitFullscreen();
    else void wrapRef.current?.requestFullscreen().catch(() => undefined);
  };

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-lg border border-border bg-surface"
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {!hasPoint && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-card backdrop-blur">
          Click the map to drop the office pin
        </div>
      )}

      {/* Layer switch + fullscreen — kept above Leaflet's panes. */}
      <div className="absolute right-3 top-3 z-[500] flex items-center gap-1.5">
        <div className="flex overflow-hidden rounded-md border border-border bg-surface/95 shadow-card backdrop-blur">
          {(Object.keys(LAYERS) as LayerKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setLayer(k)}
              className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                layer === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {LAYERS[k].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          className="rounded-md border border-border bg-surface/95 p-1.5 text-muted-foreground shadow-card backdrop-blur transition-colors hover:text-foreground"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      <MapContainer
        ref={setMap}
        center={center}
        zoom={initialZoom.current}
        maxZoom={20}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        {/* key remounts the layer on switch; maxNativeZoom lets Leaflet upscale
            the deepest tiles so zoom 20 still works for fine pin placement. */}
        <TileLayer key={layer} url={tiles.url} attribution={tiles.attribution} maxZoom={20} maxNativeZoom={tiles.maxNativeZoom} />
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
