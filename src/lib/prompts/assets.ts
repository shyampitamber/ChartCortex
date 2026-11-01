export type AssetKey =
  | "GOLD"
  | "FOREX_MAJOR"
  | "INDEX"
  | "CRYPTO"
  | "ENERGY"
  | "GENERIC";

export const ASSET_CHARACTER: Record<AssetKey, string> = {
  GOLD: `Gold (XAU/USD) trades like a major currency, acts as a safe haven and inflation hedge, and shows unusually high respect for technical levels. It can stay overbought or oversold for weeks in strong trends and produces clean stair-step moves. The 200 EMA is the macro bull/bear divider. Major round numbers (10 and especially 50 increments) are the strongest magnets and stop clusters, and a break of a round number without participation is usually a false break. Divergences are reliable when they occur at a key level. Band riding is momentum, not exhaustion.`,
  FOREX_MAJOR: `Forex majors (EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, NZDUSD) offer the deepest liquidity and tightest spreads in FX. Price is driven by relative central-bank policy, rate differentials and broad USD flows. Round numbers (xx.00 and xx.50) act as magnets and stop clusters. A clean EMA stack with a trending regime favours continuation or pullback entries, not fades. Asian session is thinner and more prone to false breaks.`,
  INDEX: `Indices (NAS100, US30, US500, GER40, UK100) trend hard intraday, respect prior day high and low, opening ranges and round numbers, and are driven by the largest capitalisation constituents plus rate expectations. Momentum is persistent, so fading a clean trend is a low-probability choice. Cash open and the first two hours carry the highest participation.`,
  CRYPTO: `Crypto (BTC, ETH and high-liquidity alts) trades continuously, is momentum driven, and is sensitive to liquidity conditions and risk sentiment. It moves violently on thin volume during off-peak hours and is prone to stop hunts around round numbers. Breakouts on thin weekend or late-Asian liquidity frequently fail. Be stricter on participation than in FX or indices.`,
  ENERGY: `Energy (WTI, Brent, NatGas) is driven by inventories, supply policy and geopolitical risk, trends persistently, and respects prior settlement, round numbers and the daily pivot. Gaps at the weekly open are common and often fill.`,
  GENERIC: `Treat the instrument as a liquid, technically driven market. Respect the visible swing structure, the dominant trend and the highest-confluence levels. Do not assume an asset class that the image does not show.`,
};

export function detectAssetKey(instrument: string): AssetKey {
  const value = instrument.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/XAU|GOLD/.test(value)) return "GOLD";
  if (/BTC|ETH|SOL|XRP|ADA|DOGE|USDT|CRYPTO/.test(value)) return "CRYPTO";
  if (/US30|US500|NAS|SPX|NDX|DJI|DOW|GER40|DE40|DAX|FTSE|UK100|CAC|FRA40|EU50|STOXX/.test(value)) return "INDEX";
  if (/OIL|WTI|BRENT|NATGAS|NGAS/.test(value)) return "ENERGY";
  if (/EUR|GBP|USD|JPY|CHF|AUD|CAD|NZD/.test(value)) return "FOREX_MAJOR";
  return "GENERIC";
}
