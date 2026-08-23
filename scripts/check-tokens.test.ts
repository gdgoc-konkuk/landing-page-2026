import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  TOKENS,
  parseOklch,
  isInSrgbGamut,
  contrastRatio,
} from '../lib/tokens.ts';
import { STAGES } from '../config/stages.config.ts';
import {
  auditTokens,
  auditThemeMirror,
  auditStageTints,
  auditEmittedCss,
  countContrastPairs,
  parseThemeColors,
  readEmittedCss,
  GLOBALS_CSS,
} from './check-tokens.ts';

const CSS = readFileSync(new URL('../' + GLOBALS_CSS, import.meta.url), 'utf8');

test('parseOklch가 토큰 문자열을 읽는다', () => {
  assert.deepEqual(parseOklch('oklch(47.9% 0.119 155)'), {
    L: 47.9,
    C: 0.119,
    H: 155,
  });
  assert.equal(parseOklch('rgb(0,0,0)'), null);
});

test('모든 토큰이 파싱된다', () => {
  for (const [name, value] of Object.entries(TOKENS)) {
    assert.ok(parseOklch(value), `${name} 파싱 실패: ${value}`);
  }
});

test('무채색 토큰이 없다 — 채도 >= 0.005', () => {
  for (const [name, value] of Object.entries(TOKENS)) {
    const c = parseOklch(value)!;
    assert.ok(c.C >= 0.005, `${name}의 채도가 ${c.C} — 무채색`);
  }
});

test('모든 토큰이 sRGB 게멋 안에 있다', () => {
  for (const [name, value] of Object.entries(TOKENS)) {
    assert.ok(isInSrgbGamut(parseOklch(value)!), `${name}가 게멋 밖: ${value}`);
  }
});

test('브랜드 색이 원본 채도를 유지한다 — 파스텔 회귀 방지', () => {
  const brand = Object.entries(TOKENS).filter(([n]) => n.startsWith('brand-'));
  assert.equal(brand.length, 4, '브랜드 색 개수가 바뀌었다 — 의도한 변경인지 확인');
  for (const [name, value] of brand) {
    const c = parseOklch(value)!.C;
    assert.ok(c >= 0.15, `${name} 채도 ${c} — 0.15 미만이면 파스텔이다`);
  }
});

test('auditTokens가 파스텔로 깎인 브랜드 색을 잡는다', () => {
  // 이전 빌드가 실제로 이 값을 썼다. 회귀하면 게이트가 잡아야 한다.
  const pastel = { ...TOKENS, 'brand-blue': 'oklch(94% 0.028 260)' };
  assert.ok(
    auditTokens(pastel).some(
      (f) => f.includes('brand-blue') && f.includes('파스텔')
    ),
    '파스텔로 깎인 브랜드 색을 잡지 못했다'
  );
});

test('본문 대비가 WCAG AA를 넘는다', () => {
  assert.ok(
    contrastRatio(TOKENS.ink, TOKENS.paper) >= 4.5,
    'ink/paper 본문 대비 미달'
  );
  assert.ok(
    contrastRatio(TOKENS['accent-ink'], TOKENS.accent) >= 4.5,
    'accent 위 텍스트 대비 미달'
  );
});

test('auditTokens가 위반 목록을 반환한다', () => {
  assert.deepEqual(auditTokens(TOKENS), []);

  // auditTokens는 Record<string, string>을 받으므로 캐스트가 필요 없다
  const withAchromatic = { ...TOKENS, broken: 'oklch(50% 0.000 155)' };
  assert.ok(
    auditTokens(withAchromatic).some((f) => f.includes('broken')),
    '무채색 토큰을 잡지 못했다'
  );

  const withUnparseable = { ...TOKENS, bad: '#ff0000' };
  assert.ok(
    auditTokens(withUnparseable).some((f) => f.includes('bad')),
    'hex 리터럴을 잡지 못했다'
  );
});

test('ink가 모든 브랜드 색 위에서 WCAG AA를 만족한다', () => {
  const brandNames = Object.keys(TOKENS).filter((n) => n.startsWith('brand-'));
  assert.ok(brandNames.length >= 1, '브랜드 토큰이 없다 — 테스트가 무의미해진다');

  // 브랜드 색 위에 놓을 수 있는 텍스트는 ink 하나뿐이다.
  // 흰 글자(accent-ink)는 네 색 전부에서 미달한다 — 그것도 확인한다.
  for (const bg of brandNames) {
    const dark = contrastRatio(TOKENS.ink, TOKENS[bg as keyof typeof TOKENS]);
    assert.ok(dark >= 4.5, `ink on ${bg} 대비 ${dark.toFixed(2)}:1 — 4.5:1 미달`);

    const light = contrastRatio(
      TOKENS['accent-ink'],
      TOKENS[bg as keyof typeof TOKENS]
    );
    assert.ok(
      light < 4.5,
      `accent-ink on ${bg}이 ${light.toFixed(2)}:1로 통과한다 — 흰 글자 금지 규칙의 근거가 사라졌으니 규칙을 재검토할 것`
    );
  }

  assert.deepEqual(auditTokens(TOKENS), []);
});

test('auditTokens는 브랜드 색 위에서 너무 밝은 ink를 잡아낸다', () => {
  // ink를 밝게 만들면 브랜드 색 위 대비가 무너진다 — 게이트가 발동하는지 증명한다.
  const withLightMuted = { ...TOKENS, ink: 'oklch(62% 0.012 155)' };
  const failures = auditTokens(withLightMuted);
  assert.ok(
    failures.some((f) => f.includes('ink') && f.includes('brand-')),
    '너무 밝은 ink가 브랜드 색 위에서 잡히지 않았다'
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// C1 회귀 방어: 미러 / 브랜드 색 / emit 검사
// ─────────────────────────────────────────────────────────────────────────────

test('parseThemeColors가 globals.css의 @theme --color-*를 뽑는다', () => {
  const colors = parseThemeColors(CSS);
  assert.ok(Object.keys(colors).length >= 15, `뽑힌 색 토큰이 ${Object.keys(colors).length}개`);
  // `--color-*: initial`은 토큰이 아니므로 제외돼야 한다
  assert.ok(!('*' in colors), 'initial 리셋 선언이 토큰으로 잡혔다');
  assert.equal(colors['brand-blue'], 'oklch(63% 0.18 260)');
});

test('parseThemeColors가 @theme 블록이 없으면 던진다', () => {
  assert.throws(() => parseThemeColors('body { color: red }'), /@theme/);
});

test('lib/tokens.ts 미러가 globals.css와 키·값 단위로 일치한다', () => {
  assert.deepEqual(auditThemeMirror(parseThemeColors(CSS), TOKENS), []);
});

test('auditThemeMirror가 값 불일치를 잡는다', () => {
  const drifted = { ...TOKENS, 'brand-blue': 'oklch(63% 0.18 261)' };
  const failures = auditThemeMirror(parseThemeColors(CSS), drifted);
  assert.ok(
    failures.some((f) => f.includes('brand-blue') && f.includes('불일치')),
    `값 드리프트를 잡지 못했다: ${JSON.stringify(failures)}`
  );
});

test('auditThemeMirror가 양방향 누락을 잡는다', () => {
  const cssColors = parseThemeColors(CSS);

  const { 'brand-green': _dropped, ...missingInMirror } = TOKENS;
  assert.ok(
    auditThemeMirror(cssColors, missingInMirror).some(
      (f) => f.includes('brand-green') && f.includes('lib/tokens.ts에는 없다')
    ),
    '미러에 없는 토큰을 잡지 못했다'
  );

  const extraInMirror = { ...TOKENS, 'brand-ghost': 'oklch(63% 0.18 200)' };
  assert.ok(
    auditThemeMirror(cssColors, extraInMirror).some(
      (f) => f.includes('brand-ghost') && f.includes('@theme에는 없다')
    ),
    '@theme에 없는 미러 항목을 잡지 못했다'
  );
});

test('모든 STAGES[].color에 대응하는 토큰이 있다 — C1의 직접 원인', () => {
  assert.equal(STAGES.length, 4, '활동 개수가 바뀌었다 — 의도한 변경인지 확인');
  assert.deepEqual(auditStageTints(STAGES.map((s) => s.color), TOKENS), []);
});

test('auditStageTints가 오타난 color를 잡는다', () => {
  const failures = auditStageTints(['brand-blu'], TOKENS);
  assert.ok(
    failures.some((f) => f.includes('brand-blu') && f.includes('투명')),
    `오타를 잡지 못했다: ${JSON.stringify(failures)}`
  );
});

test('auditEmittedCss가 pruning된 토큰을 잡는다', () => {
  // C1 당시와 같은 상황을 재현한다: 일부 토큰만 emit된 상태
  const prunedCss = ':root{--color-ink:#121814;--color-brand-green:#34a853}';
  const failures = auditEmittedCss(prunedCss, TOKENS);
  for (const missing of ['brand-blue', 'brand-red', 'brand-yellow']) {
    assert.ok(
      failures.some((f) => f.includes(`--color-${missing}`)),
      `${missing} 누락을 잡지 못했다`
    );
  }
  assert.ok(
    !failures.some((f) => f.includes('--color-brand-green:')),
    'emit된 토큰을 잘못 신고했다'
  );
});

test('빌드 산출물이 있으면 모든 토큰이 emit돼 있다', (t) => {
  const css = readEmittedCss();
  if (css === null) {
    t.skip('빌드 산출물 없음 — yarn build && yarn check:tokens:emitted가 강제 검사한다');
    return;
  }
  assert.deepEqual(auditEmittedCss(css, TOKENS), []);
});

test('countContrastPairs가 실제 검사 쌍 목록에서 파생된다', () => {
  // 브랜드 색을 하나 더하면 ink 쌍 1개가 늘어야 한다 — 하드코딩이면 안 늘어난다
  const before = countContrastPairs(TOKENS);
  const after = countContrastPairs({
    ...TOKENS,
    'brand-extra': 'oklch(63% 0.18 200)',
  });
  assert.equal(after - before, 1, '브랜드 색 추가가 쌍 개수에 반영되지 않았다');
});
