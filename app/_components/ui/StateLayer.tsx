import { STATE_LAYER } from '@/lib/m3';

/**
 * M3 state layer.
 *
 * Material에서 hover/focus/pressed는 배경색을 다른 색으로 바꾸는 게 아니라,
 * 컨테이너 위에 **on-color를 정해진 불투명도로 덮는 한 겹**이다
 * (hover 8%, focus 10%, pressed 10% — md.sys.state.*.state-layer-opacity).
 *
 * 그래서 어떤 컨테이너 색에서도 같은 세기로 반응하고, 색을 두 번 정의할 필요가
 * 없다. 이전 구현은 hover마다 배경색을 하나씩 골라 넣었고 — 그게 Material처럼
 * 보이지 않는 가장 큰 이유였다.
 *
 * `bg-current`가 곧 on-color다. 부모의 text 색을 그대로 쓰므로 컨테이너가
 * 학교색이든 paper든 알아서 맞는다.
 *
 * 부모는 `group relative overflow-hidden`이어야 한다 — overflow-hidden이
 * 애니메이션되는 코너를 따라 이 레이어를 잘라준다.
 */
export default function StateLayer() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-current opacity-0 transition-opacity duration-150 group-hover:opacity-[var(--m3-hover)] group-focus-visible:opacity-[var(--m3-focus)] group-active:opacity-[var(--m3-pressed)]"
      style={
        {
          '--m3-hover': STATE_LAYER.hover,
          '--m3-focus': STATE_LAYER.focus,
          '--m3-pressed': STATE_LAYER.pressed,
        } as React.CSSProperties
      }
    />
  );
}
