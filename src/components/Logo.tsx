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
        className="rounded-[7px]"
        style={{ width: size, height: size }}
      />
      <span className={`text-[15px] font-semibold tracking-[-0.02em] ${labelClassName}`}>
        Chart<span className="text-violet-soft">Corex</span>
      </span>
    </span>
  );
}
