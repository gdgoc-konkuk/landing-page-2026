import Shape from './Shape';
import Carousel from '../ui/Carousel';
import type { StageData } from '@/config/stages.config';

/**
 * 활동 하나
 *
 * 사진은 도형으로 잘라 들이고 각 활동의 브랜드 색으로 강하게 듀오톤 처리한다.
 * 사진의 명도와 식별성은 남기되, 네 실루엣은 하나의 시스템으로 읽힌다.
 */
/** 도형 안에 사진이 들어가므로 크게 잡는다 — 작으면 사진이 안 읽힌다. */
const SHAPE_WIDTH: Record<StageData['scale'], string> = {
  sm: 'w-[clamp(13rem,34vw,20rem)]',
  md: 'w-[clamp(15rem,40vw,24rem)]',
  lg: 'w-[clamp(16rem,44vw,27rem)]',
  xl: 'w-[clamp(17rem,48vw,30rem)]',
};

const SECTION_PAD: Record<StageData['scale'], string> = {
  sm: 'py-[clamp(2.5rem,6vw,4.5rem)]',
  md: 'py-[clamp(3rem,7vw,5.5rem)]',
  lg: 'py-[clamp(3.5rem,8vw,6.5rem)]',
  xl: 'py-[clamp(4rem,10vw,8rem)]',
};

export default function Stage({
  data,
  index,
}: {
  data: StageData;
  index: number;
}) {
  const shapeFirst = index % 2 === 0;

  return (
    <section
      aria-labelledby={`activity-${data.slug}`}
      className={`bg-surface ${SECTION_PAD[data.scale]}`}
    >
      <div className="mx-auto max-w-6xl px-[clamp(1rem,4vw,1.5rem)]">
        <div
          className={`grid grid-cols-1 items-center gap-[clamp(1.5rem,4vw,3rem)] lg:gap-[clamp(2rem,6vw,5rem)] ${
            shapeFirst
              ? 'lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]'
              : 'lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]'
          }`}
        >
          <div
            className={`mx-auto ${SHAPE_WIDTH[data.scale]} lg:mx-0 ${
              shapeFirst ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            <Shape
              shape={data.shape}
              color={data.color}
              src={data.image}
              sizes="(max-width: 64rem) 90vw, 45vw"
            />
          </div>

          <div
            className={`min-w-0 ${shapeFirst ? 'lg:order-2' : 'lg:order-1'}`}
          >
            <h2
              id={`activity-${data.slug}`}
              className="m3-section-title text-on-surface whitespace-pre-line"
            >
              {data.title}
            </h2>
            <p className="m3-body-large text-on-surface-variant mt-5 max-w-[46ch] whitespace-pre-wrap">
              {data.description}
            </p>
            {data.projects && (
              <div className="mt-9">
                <Carousel items={data.projects} label={`${data.title} 기록`} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
