import Image from 'next/image';
import { shapePath, SHAPE_ASPECT, type ShapeName } from '@/lib/shapes';
import type { BrandColor } from '@/config/stages.config';

interface ShapeProps {
  shape: ShapeName;
  color: BrandColor;
  /** 도형 안에 들어갈 사진. 없으면 브랜드 색 단색. */
  src?: string;
  /** 장식이므로 alt는 비운다. 의미는 옆 텍스트가 전달한다. */
  sizes: string;
  priority?: boolean;
}

/**
 * M3 Expressive shape 컨테이너. 사진을 도형으로 잘라낸다.
 *
 * SVG <clipPath clipPathUnits="objectBoundingBox">를 쓰는 이유:
 * 0..1 정규화 좌표라 어떤 크기·비율에도 그대로 붙고, clip-path: polygon()과 달리
 * 모서리 호를 진짜 호로 그린다.
 *
 * 도형은 활동의 식별자이므로 hover 장식은 넣지 않는다. 클릭 대상이 아닌데 섹션
 * hover만으로 움직이면 상호작용 가능하다는 잘못된 신호를 주기 때문이다.
 *
 * 서버 컴포넌트다. JS 없이도 올바른 실루엣으로 렌더된다.
 */
export default function Shape({
  shape,
  color,
  src,
  sizes,
  priority = false,
}: ShapeProps) {
  const clipId = `shape-${shape}`;

  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: SHAPE_ASPECT[shape],
        // 사진이 비거나 느릴 때 브랜드 색이 도형을 채운다.
        background: `var(--color-${color})`,
        clipPath: `url(#${clipId})`,
      }}
    >
      {src && (
        <>
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            sizes={sizes}
            className="object-cover"
          />
          {/* 브랜드 색 틴트. mix-blend-mode: color는 오버레이에서 색상·채도를,
          사진에서 명도를 가져오는 듀오톤이다 — 네 도형이 한 가족으로 읽힌다. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 mix-blend-color"
            style={{ background: `var(--color-${color})`, opacity: 0.82 }}
          />
          {/* 원본 사진은 인물·공간이 식별될 정도로만 되올린다.
          브랜드 틴트가 실루엣보다 약해지지 않도록 보정은 최소화한다. */}
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            sizes={sizes}
            aria-hidden="true"
            className="object-cover"
            style={{ opacity: 0.08 }}
          />
        </>
      )}
    </div>
  );
}

/**
 * clipPath 정의는 페이지에 한 번만 넣는다. 같은 shape을 여러 곳에서 써도
 * id가 같으므로 중복 정의를 피한다.
 */
export function ShapeDefs({ shapes }: { shapes: ShapeName[] }) {
  const unique = [...new Set(shapes)];
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        {unique.map((s) => (
          <clipPath key={s} id={`shape-${s}`} clipPathUnits="objectBoundingBox">
            <path d={shapePath(s)} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}
