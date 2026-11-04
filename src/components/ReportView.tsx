export type ReportData = {
  instrument: string;
  timeframe: string;
  bias: "Bullish" | "Bearish" | "Neutral";
  confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  entryLow: number;
  entryHigh: number;
  stop: number;
  targets: { label: string; price: number; note?: string }[];
  summary: string;
  driver: string;
  trend: string;
  support: number;
  resistance: number;
  invalidation: string;
  bos?: string;
  choch?: string;
  liquidity?: string;
  metaTime?: string;
};

export type ReportReceipt = { sam?: string | null; muse?: string | null };

const biasTone: Record<string, string> = {
  Bullish:
    "border-up/45 bg-up/20 text-up shadow-[0_0_22px_-8px_rgba(61,220,151,0.65)]",
  Bearish:
    "border-down/45 bg-down/20 text-down shadow-[0_0_22px_-8px_rgba(255,92,122,0.65)]",
  Neutral: "border-line bg-surface-2 text-muted",
};

const riskTone: Record<string, string> = {
  Low: "border-up/40 bg-up/15 text-up",
  Medium: "border-[#F5B544]/45 bg-[#F5B544]/15 text-[#F5B544]",
  High: "border-down/45 bg-down/15 text-down",
};

export function ReportView({
  data,
  format,
  idSuffix = "a",
  showHeader = true,
  showDetails = true,
  receipt,
}: {
  data: ReportData;
  format: (value: number) => string;
  idSuffix?: string;
  showHeader?: boolean;
  showDetails?: boolean;
  receipt?: ReportReceipt;
}) {
  const gradientId = `confidenceGrad-${idSuffix}`;
  const radius = 26;
  const entryMid = (data.entryLow + data.entryHigh) / 2;
  const risk = Math.abs(entryMid - data.stop);
  const rMultiple = (price: number) =>
    risk > 0 ? Math.abs(price - entryMid) / risk : 0;
  const shortId = (value?: string | null) =>
    value ? value.replace(/^.*_/, "").slice(0, 10) : "n/a";
  const confidence = Math.max(0, Math.min(100, data.confidence));

  return (
    <div className="flex h-full flex-col">
      {showHeader && (
        <div className="flex items-center justify-between">
          <span className="font-chivo text-[10px] uppercase tracking-[0.18em] text-muted">
            AI report
          </span>
          <span className="font-chivo text-[8.5px] uppercase tracking-[0.14em] text-accent">
            Institutional
          </span>
        </div>
      )}

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-chivo text-[22px] font-bold uppercase leading-none tracking-[0.01em]">
            {data.instrument}
          </div>
          <div className="mt-1 font-mono text-[10px] text-muted">{data.timeframe}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`min-w-[102px] rounded-md border px-2.5 py-1.5 text-center font-chivo text-[10.5px] font-bold uppercase tracking-[0.08em] ${
              biasTone[data.bias] ?? biasTone.Neutral
            }`}
          >
            {data.bias}
          </span>
          <span
            className={`min-w-[102px] rounded-md border px-2.5 py-1.5 text-center font-chivo text-[10.5px] font-semibold uppercase tracking-[0.08em] ${
              riskTone[data.riskLevel] ?? riskTone.Medium
            }`}
          >
            {data.riskLevel} risk
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="var(--line)"
              strokeWidth="5"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${confidence} ${100 - confidence}`}
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#81FFD9" />
                <stop offset="100%" stopColor="#F355D0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center font-mono text-[18px]">
            {confidence}
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-chivo text-[8.5px] uppercase tracking-[0.14em] text-muted">
            Institutional read
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-ink/80">{data.summary}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="font-chivo text-[10px] uppercase tracking-[0.14em] text-muted">
          Trade ladder
        </div>
        <div className="relative mt-2.5 space-y-2.5 pl-4">
          <span className="absolute bottom-2 left-[5px] top-2 w-px bg-line" aria-hidden />
          <LadderRow
            label="Entry zone"
            value={`${format(data.entryLow)} - ${format(data.entryHigh)}`}
            tone="entry"
          />
          <LadderRow label="Stop loss" value={format(data.stop)} tone="stop" />
          {data.targets.map((target) => (
            <LadderRow
              key={target.label}
              label={target.label}
              note={target.note}
              meta={`${rMultiple(target.price).toFixed(1)}R`}
              value={format(target.price)}
              tone="target"
            />
          ))}
        </div>
      </div>

      {showDetails && (
      <>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniField label="Driver" value={data.driver} />
        <MiniField label="Trend" value={data.trend} />
        <MiniField label="Support" value={format(data.support)} />
        <MiniField label="Resistance" value={format(data.resistance)} />
      </div>

      {(data.bos || data.choch || data.liquidity) && (
        <div className="mt-3">
          <div className="font-chivo text-[8.5px] uppercase tracking-[0.14em] text-muted">
            Structure
          </div>
          <div className="mt-1 space-y-1 text-[10.5px] leading-relaxed">
            {data.bos && (
              <div>
                <span className="text-muted">BOS </span>
                <span className="text-ink/80">{data.bos}</span>
              </div>
            )}
            {data.choch && (
              <div>
                <span className="text-muted">CHoCH </span>
                <span className="text-ink/80">{data.choch}</span>
              </div>
            )}
            {data.liquidity && (
              <div>
                <span className="text-muted">Liquidity </span>
                <span className="text-ink/80">{data.liquidity}</span>
              </div>
            )}
          </div>
        </div>
      )}
      </>
      )}

      <div className="mt-3 rounded-lg border border-pink/20 bg-pink/[0.05] px-3 py-2">
        <div className="font-chivo text-[8.5px] uppercase tracking-[0.14em] text-pink">
          Invalidated if
        </div>
        <div className="mt-0.5 text-[10.5px] leading-relaxed text-ink/75">
          {data.invalidation}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-2 font-mono text-[8px] uppercase tracking-[0.08em] text-muted">
        <span className="truncate">sam {shortId(receipt?.sam)}</span>
        <span className="truncate">muse {shortId(receipt?.muse)}</span>
        <span className="shrink-0">{data.metaTime ?? "12.4s"}</span>
      </div>
    </div>
  );
}

function LadderRow({
  label,
  value,
  note,
  meta,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  meta?: string;
  tone: "entry" | "stop" | "target";
}) {
  const dot =
    tone === "entry" ? "bg-violet" : tone === "stop" ? "bg-down" : "bg-up";
  const valueTone =
    tone === "entry" ? "text-ink" : tone === "stop" ? "text-down" : "text-up";
  return (
    <div className="relative flex items-center justify-between gap-2">
      <span className={`absolute -left-4 h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
      <span className="min-w-0 truncate font-chivo text-[11px] uppercase tracking-[0.08em] text-muted">
        {label}
        {note ? (
          <span className="ml-1.5 text-[10px] normal-case tracking-normal text-muted/60">{note}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-baseline gap-2">
        {meta ? (
          <span className="rounded border border-up/20 bg-up/[0.06] px-1 font-mono text-[9px] text-up/80">
            {meta}
          </span>
        ) : null}
        <span className={`font-mono text-[14px] ${valueTone}`}>{value}</span>
      </span>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas/40 px-2.5 py-1.5">
      <div className="font-chivo text-[8px] uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className="mt-0.5 truncate text-[10.5px] text-ink/80">{value}</div>
    </div>
  );
}
