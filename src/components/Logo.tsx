/* eslint-disable @next/next/no-img-element */

export function LogoLockup({
  size = 30,
  labelClassName = "",
}: {
  size?: number;
  labelClassName?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl bg-white py-1 pl-1 pr-2.5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.65)] ${labelClassName}`}
    >
      <img
        src="/brand/mark-64.png"
        width={size}
        height={size}
        alt=""
        className="rounded-lg"
        style={{ width: size, height: size }}
      />
      <span className="font-display text-[15px] font-bold tracking-[-0.01em]">
        <span className="text-[#123A6B]">Chart</span>
        <span className="text-[#FF4D9D]">Corex</span>
      </span>
    </span>
  );
}
