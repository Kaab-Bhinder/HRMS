import { useEffect, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { fetchBlobUrl } from '../../services/client';
import { filesService, organizationService } from '../../services';
import { useQuery } from '../../hooks/useQuery';
import { Avatar } from '../ui/Avatar';

/**
 * Employee profile photo: upload, preview, remove.
 *
 * The image lives in the app's file storage and is served by the authenticated
 * `/files/:id/download` endpoint — never a public URL — so it is fetched as a
 * blob and shown from an object URL. Falls back to the initials avatar when no
 * photo is set.
 */
export function EmployeePhoto({ fileId, name, onChange }: {
  fileId?: string | null;
  name: string;
  onChange: (fileId: string | null) => void;
}) {
  const { data: org } = useQuery(() => organizationService.current(), []);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setUrl(null);
      return;
    }
    let alive = true;
    let created: string | null = null;
    fetchBlobUrl(`/files/${fileId}/download`)
      .then((u) => { if (alive) { created = u; setUrl(u); } })
      .catch(() => { if (alive) setUrl(null); });
    return () => { alive = false; if (created) URL.revokeObjectURL(created); };
  }, [fileId]);

  const pick = async (file?: File) => {
    if (!file || !org?.id) return;
    if (!file.type.startsWith('image/')) {
      setErr('Choose an image file');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const att = await filesService.upload('organization', org.id, file);
      onChange(att.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {url ? (
          <img src={url} alt={name} className="h-20 w-20 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <Avatar name={name || '·'} size="lg" className="h-20 w-20 text-xl" />
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-2">
          <Camera className="h-4 w-4" />
          {fileId ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => void pick(e.target.files?.[0] ?? undefined)} />
        </label>
        {fileId && (
          <button type="button" className="ml-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-danger" onClick={() => onChange(null)}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        )}
        <p className="mt-1 text-xs text-muted-foreground">JPG or PNG. Shown on their profile and records.</p>
        {err && <p className="mt-1 text-xs text-danger">{err}</p>}
      </div>
    </div>
  );
}
