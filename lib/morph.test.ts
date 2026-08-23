import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resampleByAngle, lerpPoints, toPath, type Pt } from './morph.ts';

/** (0.5,0.5) 중심 반지름 r인 원을 count개 점으로. phase로 위상을 흔들 수 있다. */
function circle(r: number, count: number, phase = 0): Pt[] {
  return Array.from({ length: count }, (_, i) => {
    const a = phase + (2 * Math.PI * i) / count;
    return { x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) };
  });
}

const near = (a: number, b: number, tol = 1e-3) =>
  assert.ok(Math.abs(a - b) < tol, `${a} !== ${b} (허용 ${tol})`);

test('resampleByAngle — 요청한 개수를 돌려준다', () => {
  assert.equal(resampleByAngle(circle(0.4, 200), 64).length, 64);
});

test('resampleByAngle — k번째 점은 항상 같은 각도를 가리킨다', () => {
  const out = resampleByAngle(circle(0.4, 200), 8);
  out.forEach((p, k) => {
    const expected = -Math.PI + (2 * Math.PI * k) / 8;
    near(Math.atan2(p.y - 0.5, p.x - 0.5), expected);
  });
});

test('resampleByAngle — 원의 반지름을 보존한다', () => {
  for (const p of resampleByAngle(circle(0.37, 300), 32)) {
    near(Math.hypot(p.x - 0.5, p.y - 0.5), 0.37, 1e-4);
  }
});

test('resampleByAngle — 입력 위상이 달라도 같은 결과가 나온다', () => {
  // 이게 무너지면 모핑이 회전하며 넘어간다 — 정확히 이전 방식이 실패한 지점이다.
  const a = resampleByAngle(circle(0.4, 360), 16);
  const b = resampleByAngle(circle(0.4, 360, 1.234), 16);
  a.forEach((p, i) => {
    near(p.x, b[i].x, 1e-3);
    near(p.y, b[i].y, 1e-3);
  });
});

test('resampleByAngle — 감김 방향이 반대여도 같은 결과가 나온다', () => {
  const cw = circle(0.4, 360);
  const a = resampleByAngle(cw, 16);
  const b = resampleByAngle([...cw].reverse(), 16);
  a.forEach((p, i) => {
    near(p.x, b[i].x, 1e-3);
    near(p.y, b[i].y, 1e-3);
  });
});

test('lerpPoints — 양 끝과 중간', () => {
  const a: Pt[] = [{ x: 0, y: 0 }];
  const b: Pt[] = [{ x: 1, y: 2 }];
  assert.deepEqual(lerpPoints(a, b, 0), a);
  assert.deepEqual(lerpPoints(a, b, 1), b);
  assert.deepEqual(lerpPoints(a, b, 0.5), [{ x: 0.5, y: 1 }]);
});

test('lerpPoints — 점 개수가 다르면 조용히 넘어가지 않는다', () => {
  assert.throws(() => lerpPoints([{ x: 0, y: 0 }], [], 0.5), /점 개수가 다르다/);
});

test('toPath — 닫힌 다각형을 만든다', () => {
  assert.equal(
    toPath([
      { x: 0, y: 0 },
      { x: 1, y: 0.5 },
    ]),
    'M0.00000 0.00000L1.00000 0.50000Z'
  );
});
