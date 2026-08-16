import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Camera, CheckCircle2, PenLine, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Misc';
import { API_BASE } from '../../services/client';
import { extractSignature, strokesToPng } from './signature';

interface SignView {
  agreementTitle: string;
  body: string;
  signerName: string;
  status: string;
  alreadySigned: boolean;
  expiresAt: string;
  otherSigners: { name: string; status: string }[];
}

/**
 * The counterparty's view. Deliberately outside the authenticated app: someone
 * signing a contract with the company has no login here, so the token in the
 * link is the credential. Nothing on this page reveals anything about the
 * organisation beyond the document they were sent.
 */
export default function SignAgreementPage() {
  const { token = '' } = useParams();
  const [view, setView] = useState<SignView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`${API_BASE}/sign/${token}`)
      .then(async (r) => {
        const json = await r.json().catch(() => null);
        if (!live) return;
        if (!r.ok || json?.success === false) {
          setError(json?.error?.message ?? 'This signing link is not valid.');
        } else {
          setView(json.data);
          setDone(!!json.data.alreadySigned);
        }
      })
      .catch(() => live && setError('Could not reach the server. Check your connection and try again.'))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [token]);

  if (loading) {
    return <Shell><div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div></Shell>;
  }
  if (error) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <AlertCircle className="h-10 w-10 text-danger" />
          <h1 className="text-lg font-semibold text-foreground">This link cannot be opened</h1>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Links expire, and are replaced whenever the document is sent again. Ask your contact for a new one.
          </p>
        </div>
      </Shell>
    );
  }
  if (!view) return null;

  return (
    <Shell>
      <div className="space-y-6">
        <header>
          <h1 className="text-xl font-semibold text-foreground">{view.agreementTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prepared for <span className="font-medium text-foreground">{view.signerName}</span>
          </p>
        </header>

        <article className="whitespace-pre-wrap rounded-xl border border-border bg-surface-2/30 p-5 text-sm leading-relaxed text-foreground">
          {view.body}
        </article>

        {view.otherSigners.length > 0 && (
          <div className="rounded-lg border border-border p-3.5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Other signatories</p>
            <ul className="space-y-1 text-sm">
              {view.otherSigners.map((s) => (
                <li key={s.name} className="flex justify-between">
                  <span className="text-foreground">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.status === 'signed' ? 'Signed' : 'Awaiting'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {done ? (
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
            <div>
              <p className="font-medium text-foreground">Signed</p>
              <p className="text-sm text-muted-foreground">Thank you — your signature has been recorded. You can close this page.</p>
            </div>
          </div>
        ) : (
          <SignatureBlock token={token} onSigned={() => setDone(true)} />
        )}
      </div>
    </Shell>
  );
}

function SignatureBlock({ token, onSigned }: { token: string; onSigned: () => void }) {
  const [mode, setMode] = useState<'draw' | 'photo'>('draw');
  const [png, setPng] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const takePhoto = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const result = await extractSignature(file);
      if (!result) setError('No signature was found. Sign in dark ink on plain paper and fill the frame.');
      else setPng(result);
    } catch {
      setError('That image could not be read. Try another photo.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!png) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signaturePng: png }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false) {
        setError(json?.error?.message ?? 'Could not record the signature.');
      } else {
        onSigned();
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground">Sign</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Draw your signature, or photograph one on paper — the background is removed automatically.
      </p>

      <div className="mt-3 flex gap-2">
        <Button variant={mode === 'draw' ? 'primary' : 'outline'} size="sm" onClick={() => { setMode('draw'); setPng(null); }}>
          <PenLine className="h-4 w-4" /> Draw
        </Button>
        <Button variant={mode === 'photo' ? 'primary' : 'outline'} size="sm" onClick={() => { setMode('photo'); setPng(null); }}>
          <Camera className="h-4 w-4" /> Photograph
        </Button>
      </div>

      <div className="mt-4">
        {mode === 'draw' ? (
          <DrawPad onChange={setPng} />
        ) : (
          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) takePhoto(f); }}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="h-4 w-4" /> {png ? 'Take another' : 'Choose or take a photo'}
            </Button>
            {png && (
              <div className="rounded-lg border border-border bg-white p-3">
                <img src={png} alt="Your signature" className="mx-auto max-h-28" />
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 flex items-start gap-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
        </p>
      )}

      <Button className="mt-4 w-full" size="lg" disabled={!png || busy} loading={busy} onClick={submit}>
        Sign agreement
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Signing records your name, the time and your network address against this document.
      </p>
    </div>
  );
}

/** Freehand pad — works with a mouse, a trackpad or a finger. */
function DrawPad({ onChange }: { onChange: (png: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    // Match the backing store to the CSS size, or strokes land off-cursor on
    // high-DPI screens.
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111';
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={ref}
        className="h-40 w-full touch-none rounded-lg border border-border bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const ctx = e.currentTarget.getContext('2d');
          const { x, y } = pos(e);
          ctx?.beginPath();
          ctx?.moveTo(x, y);
          drawing.current = true;
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext('2d');
          const { x, y } = pos(e);
          ctx?.lineTo(x, y);
          ctx?.stroke();
        }}
        onPointerUp={(e) => {
          drawing.current = false;
          onChange(strokesToPng(e.currentTarget));
        }}
      />
      <button
        type="button"
        className="text-xs text-muted-foreground underline"
        onClick={() => {
          const c = ref.current;
          if (!c) return;
          c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
          onChange(null);
        }}
      >
        Clear
      </button>
    </div>
  );
}

/** Standalone chrome — no sidebar, no organisation navigation. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </div>
  );
}
