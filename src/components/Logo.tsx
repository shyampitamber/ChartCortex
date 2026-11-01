type Tone = "dark" | "light";

const palette: Record<Tone, { brain: string; body: string; wick: string }> = {
  dark: { brain: "#EEECEF", body: "#552FF6", wick: "#F355D0" },
  light: { brain: "#552FF6", body: "#EEECEF", wick: "#F355D0" },
};

const FOLDS = [
  "M17 20 C21 22 21 26 18 28",
  "M15 31 C19 33 19 37 16 39",
  "M47 20 C43 22 43 26 46 28",
  "M49 31 C45 33 45 37 48 39",
];

export function LogoMark({
  size = 32,
  tone = "dark",
  folds = false,
}: {
  size?: number;
  tone?: Tone;
  folds?: boolean;
}) {
  const c = palette[tone];
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="ChartCorex"
    >
      <path
        d="M28 12 C24 7 16 7 12 11 C8.5 13.5 7 17.5 8 20.5 C5 23 5 28 7 31 C5 35 6 39 9 41.5 C9 46 13 49 17.5 49 C20.5 52 25.5 51 28 48 Z"
        fill={c.brain}
      />
      <path
        d="M36 12 C40 7 48 7 52 11 C55.5 13.5 57 17.5 56 20.5 C59 23 59 28 57 31 C59 35 58 39 55 41.5 C55 46 51 49 46.5 49 C43.5 52 38.5 51 36 48 Z"
        fill={c.brain}
      />
      {folds &&
        FOLDS.map((d) => (
          <path
            key={d}
            d={d}
            stroke={tone === "dark" ? "#0B0A10" : "#EEECEF"}
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
            opacity="0.45"
          />
        ))}
      <line
        x1="32"
        y1="7"
        x2="32"
        y2="21"
        stroke={c.wick}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect x="28.4" y="21" width="7.2" height="20" rx="2.2" fill={c.body} />
      <line
        x1="32"
        y1="41"
        x2="32"
        y2="53"
        stroke={c.wick}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoLockup({
  tone = "dark",
  size = 30,
  labelClassName = "",
}: {
  tone?: Tone;
  size?: number;
  labelClassName?: string;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} tone={tone} folds={size >= 36} />
      <span className={`text-[15px] font-semibold tracking-[-0.02em] ${labelClassName}`}>
        Chart
        <span className={tone === "dark" ? "text-violet-soft" : "text-violet"}>
          Corex
        </span>
      </span>
    </span>
  );
}
