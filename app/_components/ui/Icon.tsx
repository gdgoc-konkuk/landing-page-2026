import type { IconData } from '@/lib/icons';

/**
 * 아이콘 하나. lib/icons.ts의 원본 데이터를 그대로 그린다.
 *
 * fill로 그린다 — Material Symbols는 stroke가 아니라 채운 도형이다.
 * 이전 구현은 화살표와 겹쇠를 직접 그리고 stroke-width로 두께를 흉내냈는데,
 * 그러면 획이 폰트·다른 아이콘과 어긋난다.
 *
 * viewBox는 세트마다 다르므로(Material Symbols는 "0 -960 960 960",
 * 브랜드 마크는 "0 0 24 24") 데이터에 들어있는 값을 쓴다.
 *
 * size는 스펙 값을 넘긴다 — 버튼 사이즈별 icon-size, chip은 18.
 */
export default function Icon({
  data,
  size,
  className,
}: {
  data: IconData;
  size: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox={data.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {data.paths.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </svg>
  );
}
