import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Users } from 'lucide-react';
import { attendanceService, type OfficeMap, type MapEmployee, type MapSite } from '../../services';
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

/**
 * Frames the map on whatever is selected: one site zooms to it, "All sites"
 * fits every one in view. Re-runs on selection change — unlike the old
 * one-shot recentre, which could only ever show head office.
 */
function FitSites({ sites, selectedId }: { sites: MapSite[]; selectedId: string }) {
  const map = useMap();
  useEffect(() => {
    if (!sites.length) return;
    const shown = selectedId === 'all' ? sites : sites.filter((s) => s.id === selectedId);
    if (!shown.length) return;
    if (shown.length === 1) {
      map.setView([shown[0].lat, shown[0].lng], 16);
      return;
    }
    map.fitBounds(L.latLngBounds(shown.map((s) => [s.lat, s.lng] as [number, number])), {
      padding: [48, 48],
      maxZoom: 16,
    });
  }, [sites, selectedId, map]);
  return null;
}

export function LiveOfficeMap({ height = 380 }: { height?: number }) {
  const { theme } = useTheme();
  const [data, setData] = useState<OfficeMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  /** 'all' shows every site at once; otherwise one site's id. */
  const [selected, setSelected] = useState<string>('all');

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
  // Tolerate the older single-office payload so a stale API can't blank the map.
  const sites: MapSite[] = data?.sites?.length ? data.sites : data?.office ? [data.office] : [];
  const shown = selected === 'all' ? sites : sites.filter((s) => s.id === selected);
  const center = useMemo<[number, number]>(
    () => (shown[0] ? [shown[0].lat, shown[0].lng] : sites[0] ? [sites[0].lat, sites[0].lng] : [0, 0]),
    [shown, sites],
  );

  if (loading) return <div style={{ height }}><Skeleton className="h-full w-full" /></div>;
  if (!sites.length) return <div style={{ height }}><EmptyState icon={<Users className="h-6 w-6" />} title="No work sites mapped" description="Add coordinates to a location in Organization → Locations to see the live map." /></div>;

  return (
    // `isolate` traps Leaflet's internal z-indexes (up to ~1000) inside this
    // box so the map can never bleed over app modals (z-50).
    <div className="relative isolate overflow-hidden rounded-xl border border-border" style={{ height }}>
      {sites.length > 1 && (
        <div className="absolute left-3 top-3 z-[500]">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-full border border-border bg-surface/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-card backdrop-blur focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Work site"
          >
            <option value="all">All sites ({sites.length})</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}{s.clientName ? ` — ${s.clientName}` : ''}</option>
            ))}
          </select>
        </div>
      )}
      <div className="pointer-events-none absolute right-3 top-3 z-[500] flex items-center gap-2 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-card backdrop-blur">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-success" /></span>
        {data?.count ?? 0} checked in
        {refreshing && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>

      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom preferCanvas>
        <TileLayer url={tiles.url} attribution={tiles.attribution} />
        <FitSites sites={sites} selectedId={selected} />
        {shown.map((s) => (
          <div key={s.id}>
            <Circle
              center={[s.lat, s.lng]}
              radius={s.radiusMeters}
              pathOptions={{
                // Client premises read differently from an own branch at a glance.
                color: s.clientName ? 'hsl(28 80% 52%)' : 'hsl(256 50% 62%)',
                fillColor: s.clientName ? 'hsl(28 80% 52%)' : 'hsl(256 50% 62%)',
                fillOpacity: 0.1, weight: 1.5,
              }}
            />
            <Marker
              position={[s.lat, s.lng]}
              icon={L.divIcon({ className: '', html: `<div style="width:18px;height:18px;border-radius:50%;background:${s.clientName ? 'hsl(28 80% 42%)' : 'hsl(40 9% 15%)'};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] })}
            >
              <Popup>
                <b>{s.name}</b><br />
                {s.clientName ? `Client site · ${s.clientName}` : 'Own site'}{s.isDefault ? ' · default' : ''}<br />
                {s.radiusMeters}m geofence
              </Popup>
            </Marker>
          </div>
        ))}

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
