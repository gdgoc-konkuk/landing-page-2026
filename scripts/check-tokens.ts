import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  TOKENS,
  parseOklch,
  isInSrgbGamut,
  contrastRatio,
  type TokenName,
} from '../lib/tokens.ts';
import { STAGES } from '../config/stages.config.ts';

const BRAND_CHROMA_MIN = 0.15;
const ACCENT_CHROMA_MIN = 0.1;
const ACCENT_CHROMA_MAX = 0.2;

/** 대비 쌍의 단일 출처. auditTokens와 countContrastPairs가 같은 목록을 쓴다. */
const BASE_PAIRS: Array<[string, string, number, string]> = [
  ['ink', 'paper', 4.5, '본문'],
  ['ink-2', 'paper', 4.5, '보조 본문'],
  ['accent-ink', 'accent', 4.5, 'accent 위 텍스트'],
  ['muted', 'paper', 3, '약화 텍스트(대형)'],
  ['on-primary', 'primary', 4.5, 'M3 primary 위 텍스트'],
  [
    'on-secondary-container',
    'secondary-container',
    4.5,
    'M3 secondary container 위 텍스트',
  ],
  ['on-secondary', 'secondary', 4.5, 'M3 secondary 위 텍스트'],
  ['on-tertiary', 'tertiary', 4.5, 'M3 tertiary 위 텍스트'],
  ['on-surface', 'surface', 4.5, 'M3 surface 위 텍스트'],
  [
    'on-surface-variant',
    'surface-container',
    4.5,
    'M3 surface container 위 보조 텍스트',
  ],
];

/** auditTokens가 실제로 검사하는 대비 쌍의 개수 — CLI 리포트용. */
export function countContrastPairs(tokens: Record<string, string>): number {
  const brandNames = Object.keys(tokens).filter((n) => n.startsWith('brand-'));
  return BASE_PAIRS.length + brandNames.length;
}

/** 위반 사항을 사람이 읽을 문자열 배열로 반환한다. 빈 배열이면 통과. */
export function auditTokens(tokens: Record<string, string>): string[] {
  const failures: string[] = [];

  for (const [name, value] of Object.entries(tokens)) {
    const c = parseOklch(value);
    if (!c) {
      failures.push(`${name}: OKLCH로 파싱 불가 — "${value}"`);
      continue;
    }
    if (c.C < 0.005) {
      failures.push(`${name}: 채도 ${c.C} — 무채색 금지 (>= 0.005)`);
    }
    if (!isInSrgbGamut(c)) {
      failures.push(`${name}: sRGB 게멋 밖 — "${value}"`);
    }
    if (c.L >= 99.5 && c.C < 0.01) {
      failures.push(`${name}: 순수 흰색에 가깝다 — 틴트 필요`);
    }
  }

  const accent = parseOklch(tokens.accent ?? '');
  if (
    accent &&
    (accent.C < ACCENT_CHROMA_MIN || accent.C > ACCENT_CHROMA_MAX)
  ) {
    failures.push(
      `accent: 채도 ${accent.C}가 허용 범위 ${ACCENT_CHROMA_MIN}–${ACCENT_CHROMA_MAX} 밖`,
    );
  }

  // 브랜드 색은 원본 채도를 유지해야 한다.
  // 이전 버전은 이 값들을 0.03 틴트로 깎아서(브랜드 색의 17%) 베이지로 만들었고,
  // M3 Expressive가 전혀 읽히지 않는 원인이었다. 그 회귀를 여기서 막는다.
  for (const [name, value] of Object.entries(tokens)) {
    if (!name.startsWith('brand-')) continue;
    const c = parseOklch(value);
    if (c && c.C < BRAND_CHROMA_MIN) {
      failures.push(
        `${name}: 채도 ${c.C} — 브랜드 색은 ${BRAND_CHROMA_MIN} 이상이어야 한다 (파스텔로 깎으면 M3E가 죽는다)`,
      );
    }
  }

  const pairs: Array<[string, string, number, string]> = [...BASE_PAIRS];

  // 브랜드 색 위에 텍스트를 놓는다면 반드시 --color-ink다. 측정에서 나온 규칙:
  //   흰 글자는 blue 3.41 / red 3.76 / yellow 1.85 / green 2.93 — 전부 미달.
  //   검은 글자는 blue 5.26 / red 4.77 / yellow 9.68 / green 6.13 — 전부 통과.
  // ink-2·muted는 브랜드 색 위에 놓지 않는다(현 설계에서 브랜드 색은 도형 채움이고
  // 텍스트 배경이 아니다). 쓰지 않는 조합을 검사하면 게이트가 소음이 된다.
  // 브랜드 이름은 키에서 동적으로 뽑으므로 5번째 색이 추가돼도 자동 커버된다.
  const brandNames = Object.keys(tokens).filter((n) => n.startsWith('brand-'));
  for (const bg of brandNames) {
    pairs.push(['ink', bg, 4.5, `브랜드 색 위 ink`]);
  }

  for (const [fg, bg, min, label] of pairs) {
    if (!tokens[fg] || !tokens[bg]) continue;
    const r = contrastRatio(tokens[fg], tokens[bg]);
    if (r < min) {
      failures.push(
        `${label} 대비 ${r.toFixed(2)}:1 — ${min}:1 미달 (${fg} on ${bg})`,
      );
    }
  }

  return failures;
}

// ─────────────────────────────────────────────────────────────────────────────
// 계층 2: 미러가 실제 소스와 일치하는지
// ─────────────────────────────────────────────────────────────────────────────

/** 스크립트를 어디서 실행해도 같은 파일을 읽도록 저장소 루트를 고정한다. */
const REPO_ROOT = join(import.meta.dirname, '..');

export const GLOBALS_CSS = 'app/globals.css';

/**
 * app/globals.css의 @theme 블록에서 --color-* 선언을 뽑는다.
 * `--color-*: initial`(기본 팔레트 비우기)은 토큰이 아니므로 제외한다.
 */
export function parseThemeColors(css: string): Record<string, string> {
  const block = css.match(/@theme[^{]*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error(`${GLOBALS_CSS}에서 @theme 블록을 찾지 못했다`);

  const out: Record<string, string> = {};
  for (const m of block[1].matchAll(/^\s*--color-([\w-]+)\s*:\s*([^;]+);/gm)) {
    const name = m[1];
    const value = m[2].trim();
    if (name === '*' || value === 'initial') continue;
    out[name] = value;
  }
  return out;
}

/** lib/tokens.ts의 미러가 globals.css와 키·값 단위로 일치하는지 검사한다. */
export function auditThemeMirror(
  cssColors: Record<string, string>,
  tokens: Record<string, string>,
): string[] {
  const failures: string[] = [];
  for (const name of Object.keys(cssColors)) {
    if (!(name in tokens)) {
      failures.push(
        `${GLOBALS_CSS}에 --color-${name}이 있는데 lib/tokens.ts에는 없다`,
      );
    } else if (cssColors[name] !== tokens[name]) {
      failures.push(
        `--color-${name} 값 불일치 — css "${cssColors[name]}" vs tokens "${tokens[name]}"`,
      );
    }
  }
  for (const name of Object.keys(tokens)) {
    if (!(name in cssColors)) {
      failures.push(
        `lib/tokens.ts에 ${name}이 있는데 ${GLOBALS_CSS}의 @theme에는 없다`,
      );
    }
  }
  return failures;
}

/** STAGES[].color가 전부 실존하는 brand-* 토큰을 가리키는지 검사한다. */
export function auditStageTints(
  tints: readonly string[],
  tokens: Record<string, string>,
): string[] {
  const failures: string[] = [];
  for (const tint of tints) {
    if (!(tint in tokens)) {
      failures.push(
        `config/stages.config.ts의 tint "${tint}"에 대응하는 토큰이 없다 — 배경이 투명해진다`,
      );
    }
  }
  return failures;
}

// ─────────────────────────────────────────────────────────────────────────────
// 계층 3: 브라우저가 실제로 받는 CSS에 토큰이 존재하는지
//   Tailwind v4는 사용이 "관찰된" 테마 변수만 emit한다. 소스 CSS를 검사해도
//   pruning은 잡히지 않으므로 빌드 산출물을 직접 본다.
//   값 비교는 하지 않는다 — Lightning CSS가 oklch()를 hex/lab()으로 변환하고
//   브라우저 타깃에 따라 형태가 달라지기 때문이다. 존재 여부만 검사한다.
// ─────────────────────────────────────────────────────────────────────────────

export const BUILD_CSS_DIR = '.next/static';

function walkCssFiles(dir: string): string[] {
  let out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out = out.concat(walkCssFiles(p));
    else if (entry.endsWith('.css')) out.push(p);
  }
  return out;
}

/** 빌드 산출물 CSS를 모두 이어붙여 돌려준다. 없으면 null. */
export function readEmittedCss(
  dir = join(REPO_ROOT, BUILD_CSS_DIR),
): string | null {
  let files: string[];
  try {
    files = walkCssFiles(dir);
  } catch {
    return null;
  }
  if (!files.length) return null;
  return files.map((f) => readFileSync(f, 'utf8')).join('\n');
}

/** emit된 CSS에 각 토큰의 커스텀 프로퍼티 선언이 실제로 있는지 검사한다. */
export function auditEmittedCss(
  css: string,
  tokens: Record<string, string>,
): string[] {
  const failures: string[] = [];
  for (const name of Object.keys(tokens)) {
    if (!css.includes(`--color-${name}:`)) {
      failures.push(
        `--color-${name}이 빌드된 CSS에 없다 — Tailwind가 pruning했다 (@theme static 확인)`,
      );
    }
  }
  return failures;
}

// CLI로 직접 실행될 때만 동작
if (import.meta.filename === process.argv[1]) {
  // --emitted: 빌드 산출물 검사를 필수로 만든다. CI는 yarn build 뒤에 이걸 쓴다.
  const requireEmitted = process.argv.includes('--emitted');
  const failures = [
    ...auditTokens(TOKENS),
    ...auditThemeMirror(
      parseThemeColors(readFileSync(join(REPO_ROOT, GLOBALS_CSS), 'utf8')),
      TOKENS,
    ),
    ...auditStageTints(
      STAGES.map((s) => s.color),
      TOKENS,
    ),
  ];

  const emitted = readEmittedCss();
  let emittedNote: string;
  if (emitted) {
    failures.push(...auditEmittedCss(emitted, TOKENS));
    emittedNote = '빌드 CSS 검사 O';
  } else if (requireEmitted) {
    failures.push(
      `${BUILD_CSS_DIR}에 CSS가 없다 — --emitted는 yarn build 이후에 실행해야 한다`,
    );
    emittedNote = '빌드 CSS 없음';
  } else {
    // 조용히 넘기지 않는다. CI는 build 뒤에 --emitted로 한 번 더 돈다.
    console.warn(
      `경고: ${BUILD_CSS_DIR}에 CSS가 없어 emit 검사를 건너뛴다. ` +
        '`yarn build && yarn check:tokens:emitted`로 강제할 수 있다.',
    );
    emittedNote = '빌드 CSS 검사 SKIP';
  }

  if (failures.length) {
    console.error(
      '토큰 게이트 실패:\n' + failures.map((f) => `  - ${f}`).join('\n'),
    );
    process.exit(1);
  }
  console.log(
    `토큰 게이트 통과 — 토큰 ${Object.keys(TOKENS).length}개, ` +
      `대비 쌍 ${countContrastPairs(TOKENS)}개, ` +
      `brand color ${STAGES.length}개, globals.css 미러 일치, ${emittedNote}`,
  );
}
