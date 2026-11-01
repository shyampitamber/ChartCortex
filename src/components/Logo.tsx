/* eslint-disable @next/next/no-img-element */

export function LogoLockup({
  size = 30,
  labelClassName = "",
}: {
  size?: number;
  labelClassName?: string;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <img
        src="/brand/mark-64.png"
        width={size}
        height={size}
        alt=""
        className="rounded-[9px]"
        style={{ width: size, height: size }}
      />
      <span
        className={`font-display text-[16px] font-bold tracking-[-0.01em] ${labelClassName}`}
      >
        Chart<span className="text-violet">Corex</span>
      </span>
    </span>
  );
}
