import { useEffect, useState } from 'react';
import { fetchBlobUrl } from '../services/client';
import { Avatar } from './ui/Avatar';

/**
 * An employee's avatar: their uploaded photo when one exists, otherwise the
 * initials avatar. The image is served by the authenticated files endpoint, so
 * it's fetched as a blob rather than set as a plain `src` (a bare URL would be
 * unauthenticated and 401).
 */
export function EmployeeAvatar({ name, fileId, size = 'md', className }: {
  name: string;
  fileId?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

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

  if (!url) return <Avatar name={name} size={size} className={className} />;
  const px = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-16 w-16' : 'h-10 w-10';
  return <img src={url} alt={name} className={`${px} shrink-0 rounded-full object-cover ring-1 ring-border ${className ?? ''}`} />;
}
