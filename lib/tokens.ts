/**
 * app/globals.css의 @theme --color-* 값을 검증 스크립트가 읽을 수 있게 미러링한다.
 * 값을 바꿀 때는 두 곳을 함께 고쳐야 한다.
 *
 * 실제로 보장되는 것 (scripts/check-tokens.ts):
 *  - `yarn check:tokens`: 이 객체와 globals.css의 @theme 블록이 키·값 단위로 일치하고,
 *    config/stages.config.ts의 모든 tint가 여기 존재하며, 대비/게멋/채도 규칙을 만족한다.
 *  - `yarn check:tokens:emitted` (yarn build 이후): 빌드된 CSS에 각 토큰의
 *    커스텀 프로퍼티 선언이 실제로 존재한다. Tailwind pruning을 잡는 유일한 검사다.
 *
 * 보장되지 않는 것: 빌드된 CSS의 *값* 비교 (Lightning CSS가 oklch를 hex/lab으로
 * 변환한다), 그리고 컴포넌트가 이 토큰을 올바른 곳에 쓰는지.
 */
export const TOKENS = {
  accent: 'oklch(47.9% 0.119 155)',
  'accent-ink': 'oklch(97% 0.008 155)',
  focus: 'oklch(52% 0.12 155)',
  paper: 'oklch(97% 0.008 155)',
  'paper-2': 'oklch(94% 0.01 155)',
  'paper-3': 'oklch(91% 0.012 155)',
  ink: 'oklch(20% 0.012 155)',
  'ink-2': 'oklch(42% 0.012 155)',
  muted: 'oklch(52% 0.012 155)',
  rule: 'oklch(80% 0.012 155)',
  'rule-2': 'oklch(86% 0.01 155)',
  primary: 'oklch(47.9% 0.119 155)',
  'on-primary': 'oklch(97% 0.008 155)',
  secondary: 'oklch(63% 0.18 260)',
  'on-secondary': 'oklch(20% 0.012 155)',
  'secondary-container': 'oklch(90.923% 0.035592 147.872)',
  'on-secondary-container': 'oklch(21.935% 0.033772 153.53)',
  tertiary: 'oklch(79.6% 0.167 76)',
  'on-tertiary': 'oklch(20% 0.012 155)',
  surface: 'oklch(97% 0.008 155)',
  'surface-container-low': 'oklch(94% 0.01 155)',
  'surface-container': 'oklch(91% 0.012 155)',
  'surface-container-high': 'oklch(91% 0.012 155)',
  'on-surface': 'oklch(20% 0.012 155)',
  'on-surface-variant': 'oklch(42% 0.012 155)',
  outline: 'oklch(80% 0.012 155)',
  'outline-variant': 'oklch(86% 0.01 155)',
  'brand-blue': 'oklch(63% 0.18 260)',
  'brand-red': 'oklch(62.6% 0.2 29)',
  'brand-yellow': 'oklch(79.6% 0.167 76)',
  'brand-green': 'oklch(64.8% 0.16 148)',
} as const;

export type TokenName = keyof typeof TOKENS;

export interface Oklch {
  L: number; // 0..100
  C: number;
  H: number;
}

export function parseOklch(s: string): Oklch | null {
  const m = s.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!m) return null;
  return { L: parseFloat(m[1]), C: parseFloat(m[2]), H: parseFloat(m[3]) };
}

/** OKLCH -> 선형 sRGB. 게멋 밖이면 성분이 0..1을 벗어난다. */
function oklchToLinearRgb({ L, C, H }: Oklch): [number, number, number] {
  const l = L / 100;
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L3 = l_ ** 3;
  const M3 = m_ ** 3;
  const S3 = s_ ** 3;

  return [
    +4.0767416621 * L3 - 3.3077115913 * M3 + 0.2309699292 * S3,
    -1.2684380046 * L3 + 2.6097574011 * M3 - 0.3413193965 * S3,
    -0.0041960863 * L3 - 0.7034186147 * M3 + 1.707614701 * S3,
  ];
}

export function isInSrgbGamut(c: Oklch, tolerance = 0.001): boolean {
  return oklchToLinearRgb(c).every(
    (v) => v >= -tolerance && v <= 1 + tolerance,
  );
}

/** WCAG 2.x 상대 휘도. */
function relativeLuminance(c: Oklch): number {
  const [r, g, b] = oklchToLinearRgb(c).map((v) => Math.min(1, Math.max(0, v)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG 2.x 대비율 (1..21).
 * 스펙은 APCA를 선호하지만 APCA는 아직 초안이고 구현 오류 위험이 크다.
 * 법적 기준이자 검증이 확실한 WCAG 2.x를 자동 게이트로 쓴다.
 * 본문 4.5:1, 대형 텍스트 3:1이 하한.
 */
export function contrastRatio(fg: string, bg: string): number {
  const a = parseOklch(fg);
  const b = parseOklch(bg);
  if (!a || !b) throw new Error(`파싱 불가: ${fg} 또는 ${bg}`);
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
