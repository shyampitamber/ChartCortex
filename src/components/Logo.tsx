/* eslint-disable @next/next/no-img-element */

export function LogoLockup({
  size = 32,
  labelClassName = "",
}: {
  size?: number;
  labelClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${labelClassName}`}>
      <img
        src="/brand/mark-64.png"
        width={size}
        height={size}
        alt=""
        className="rounded-lg"
        style={{ width: size, height: size }}
      />
      <span className="text-[17px] font-bold tracking-[-0.01em]">
        <span className="text-[#105BFF]">Chart</span>
        <span className="text-[#F355D0]">Corex</span>
      </span>
    </span>
  );
}
