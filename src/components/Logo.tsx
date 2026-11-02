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
        src="/brand/mark-t-64.png"
        width={size}
        height={size}
        alt=""
        className="rounded-lg"
        style={{ width: size, height: size }}
      />
      <span className="font-poppins text-[17px] font-semibold tracking-[-0.01em]">
        <span className="text-[#105BFF]">Chart</span>
        <span className="text-[#F355D0]">Cortex</span>
      </span>
    </span>
  );
}
