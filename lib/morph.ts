/**
 * 도형 사이의 진짜 정점 모핑.
 *
 * lib/shapes.ts의 path들은 명령 수가 6/8/32개로 서로 다르다. 그래서 CSS도
 * motion도 이 path들을 직접 보간하지 못한다. 대신 각 path를 같은 규칙으로
 * 다시 뽑아서 점끼리 보간한다.
 *
 * 곡선 평가는 브라우저가 한다 — SVGGeometryElement.getPointAtLength가 정확한
 * 좌표를 준다. flubber 같은 라이브러리를 넣지 않은 이유가 이것이다: 그
 * 라이브러리들이 하는 일이 곡선을 다각형으로 펴는 것인데, 그건 브라우저가
 * 이미 공짜로 정확하게 해주는 일이다.
 *
 * 이 파일에는 DOM이 필요 없는 순수 함수만 둔다 — 그래서 테스트할 수 있다.
 * 샘플링(getPointAtLength)은 쓰는 쪽 컴포넌트에 있다.
 */

export interface Pt {
  x: number;
  y: number;
}

/** 도형 좌표계의 중심. clipPathUnits="objectBoundingBox"라 항상 (0.5, 0.5)다. */
const CX = 0.5;
const CY = 0.5;

/**
 * 길이로 뽑은 점들을 각도로 다시 뽑는다. 모핑의 핵심이다.
 *
 * 처음에는 길이로 뽑은 점열의 감김 방향과 시작점을 맞추는 방식을 썼다.
 * 시작점을 "가장 오른쪽 점"으로 잡았는데, pill의 오른쪽은 직선이라 그 위의
 * 여러 점이 동점이 되고 어느 점이 뽑히는지가 샘플링 위상에 따라 흔들렸다.
 * 시작점이 흔들리면 보간이 회전하며 넘어간다.
 *
 * 각도로 뽑으면 그 문제가 통째로 없어진다. k번째 점은 항상 각도
 * -π + 2πk/n 방향이므로 세 도형의 k번째 점이 같은 방향을 가리킨다.
 * 감김 방향도 각도 정렬이 알아서 통일한다.
 *
 * 전제는 도형이 중심에 대해 star-convex라는 것 — 중심에서 나간 반직선이
 * 경계를 한 번만 만난다. clover4 / verySunny / pill 모두 그렇다.
 */
export function resampleByAngle(pts: Pt[], n: number): Pt[] {
  const polar = pts
    .map((p) => ({
      a: Math.atan2(p.y - CY, p.x - CX),
      r: Math.hypot(p.x - CX, p.y - CY),
    }))
    .sort((p, q) => p.a - q.a);

  const out: Pt[] = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI + (2 * Math.PI * k) / n;

    // a를 감싸는 두 샘플을 찾는다. 정렬돼 있으므로 첫 번째로 넘어서는 지점이다.
    let hi = polar.findIndex((p) => p.a >= a);
    if (hi === -1) hi = 0; // a가 마지막 샘플보다 크면 처음으로 감싼다
    const lo = (hi - 1 + polar.length) % polar.length;

    const pLo = polar[lo];
    const pHi = polar[hi];
    // 감쌀 때 각도 차가 음수가 되므로 2π를 더해 편다.
    let span = pHi.a - pLo.a;
    if (span <= 0) span += 2 * Math.PI;
    let into = a - pLo.a;
    if (into < 0) into += 2 * Math.PI;

    const t = span === 0 ? 0 : into / span;
    const r = pLo.r + (pHi.r - pLo.r) * t;
    out.push({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) });
  }
  return out;
}

/** 같은 길이의 두 점열을 t(0..1)로 섞는다. */
export function lerpPoints(a: Pt[], b: Pt[], t: number): Pt[] {
  if (a.length !== b.length) {
    throw new Error(`점 개수가 다르다: ${a.length} vs ${b.length}`);
  }
  return a.map((p, i) => ({
    x: p.x + (b[i].x - p.x) * t,
    y: p.y + (b[i].y - p.y) * t,
  }));
}

/**
 * 0..1 좌표 다각형을 clipPath용 d 문자열로.
 * clipPathUnits="objectBoundingBox"에 그대로 넣는다.
 */
export function toPath(pts: Pt[]): string {
  const n = (v: number) => v.toFixed(5);
  let d = `M${n(pts[0].x)} ${n(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) d += `L${n(pts[i].x)} ${n(pts[i].y)}`;
  return `${d}Z`;
}
