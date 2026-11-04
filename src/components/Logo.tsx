/* eslint-disable @next/next/no-img-element */

export function LogoLockup({
  size = 38,
  labelClassName = "",
}: {
  size?: number;
  labelClassName?: string;
}) {
  const line = Math.round(size * 0.44);
  return (
    <span className={`inline-flex items-center gap-2.5 ${labelClassName}`}>
      <span className="relative inline-flex shrink-0">
        <span
          aria-hidden
          className="absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(16,91,255,0.55),rgba(243,85,208,0.28)_52%,transparent_72%)] blur-md"
        />
        <img
          src="/brand/mark-t-64.png"
          width={size}
          height={size}
          alt=""
          className="relative rounded-lg drop-shadow-[0_0_14px_rgba(129,255,217,0.4)]"
          style={{ width: size, height: size }}
        />
      </span>
      <span className="flex flex-col justify-between" style={{ height: size }}>
        <span
          className="font-chivo font-black uppercase leading-none text-[#6E9AFF]"
          style={{ fontSize: line, letterSpacing: "0.01em" }}
        >
          Chart
        </span>
        <span
          className="font-chivo font-black uppercase leading-none text-[#F355D0]"
          style={{ fontSize: line, letterSpacing: "0.01em" }}
        >
          Cortex
        </span>
      </span>
    </span>
  );
}
