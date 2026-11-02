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
      <img
        src="/brand/mark-t-64.png"
        width={size}
        height={size}
        alt=""
        className="rounded-lg"
        style={{ width: size, height: size }}
      />
      <span className="flex flex-col justify-between" style={{ height: size }}>
        <span
          className="font-chivo font-black uppercase leading-none text-[#105BFF]"
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
