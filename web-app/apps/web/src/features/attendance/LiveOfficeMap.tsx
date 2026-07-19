import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Users } from 'lucide-react';
import { attendanceService, type OfficeMap, type MapEmployee } from '../../services';
import { useTheme } from '../../store/theme';
import { EmptyState, Skeleton } from '../../components/feedback/States';

const POLL_MS = 20_000;

// Clean, premium basemaps (free, no key). Swap to Google tiles later if desired.
const TILES = {
  light: { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attribution: '&copy; OpenStreetMap &copy; CARTO' },
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; OpenStreetMap &copy; CARTO' },
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}
function hue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}
function avatarIcon(e: MapEmployee): L.DivIcon {
  const h = hue(e.name);
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,hsl(${h} 62% 52%),hsl(${(h + 30) % 360} 62% 44%));color:#fff;display:flex;align-items:center;justify-content:center;font:600 11px/1 Inter,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff">${initials(e.name)}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}
// Cluster bubble styled to match the app.
function clusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const n = cluster.getChildCount();
  const size = n < 10 ? 36 : n < 50 ? 44 : 52;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:hsl(256 50% 62% / .95);color:#fff;display:flex;align-items:center;justify-content:center;font:700 13px Inter,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3);border:3px solid #fff">${n}</div>`,
    className: '',
    iconSize: [size, size],
  });
}

/** Recenters the map when the office coordinates first load. */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (!done.current) { map.setView([lat, lng], 16); done.current = true; }
  }, [lat, lng, map]);
  return null;
}

export function LiveOfficeMap({ height = 380 }: { height?: number }) {
  const { theme } = useTheme();
  const [data, setData] = useState<OfficeMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (initial = false) => {
    if (!initial) setRefreshing(true);
    try {
      setData(await attendanceService.map());
    } catch { /* keep last */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    load(true);
    const t = setInterval(() => load(), POLL_MS);
    return () => clearInterval(t);
  }, []);

  const tiles = theme === 'dark' ? TILES.dark : TILES.light;
  const office = data?.office;
  const center = useMemo<[number, number]>(() => (office ? [office.lat, office.lng] : [0, 0]), [office]);

  if (loading) return <div style={{ height }}><Skeleton className="h-full w-full" /></div>;
  if (!office) return <div style={{ height }}><EmptyState icon={<Users className="h-6 w-6" />} title="Set the office location" description="Add office coordinates in Attendance Settings to see the live map." /></div>;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border" style={{ height }}>
      <div className="pointer-events-none absolute right-3 top-3 z-[500] flex items-center gap-2 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-card backdrop-blur">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-success" /></span>
        {data?.count ?? 0} checked in
        {refreshing && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>

      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom preferCanvas>
        <TileLayer url={tiles.url} attribution={tiles.attribution} />
        <Recenter lat={office.lat} lng={office.lng} />
        <Circle center={center} radius={office.radiusMeters} pathOptions={{ color: 'hsl(256 50% 62%)', fillColor: 'hsl(256 50% 62%)', fillOpacity: 0.1, weight: 1.5 }} />
        <Marker position={center} icon={L.divIcon({ className: '', html: `<div style="width:18px;height:18px;border-radius:50%;background:hsl(40 9% 15%);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] })}>
          <Popup><b>{office.name}</b><br />Office · {office.radiusMeters}m geofence</Popup>
        </Marker>

        <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIcon} maxClusterRadius={50} showCoverageOnHover={false}>
          {(data?.employees ?? []).map((e) => (
            <Marker key={e.id} position={[e.lat, e.lng]} icon={avatarIcon(e)}>
              <Popup>
                <b>{e.name}</b><br />
                {e.employeeCode}{e.departmentName ? ` · ${e.departmentName}` : ''}<br />
                <span style={{ color: '#16a34a' }}>● Checked in</span> since {new Date(e.since).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
