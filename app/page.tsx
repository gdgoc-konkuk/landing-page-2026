import NavBar from './_components/nav/NavBar';
import RecruitToolbar from './_components/nav/RecruitToolbar';
import Hero from './_components/hero/Hero';
import IntroSection from './_components/intro/IntroSection';
import Stage from './_components/stage/Stage';
import { ShapeDefs } from './_components/stage/Shape';
import Footer from './_components/footer/Footer';
import { RECRUIT } from '@/config/recruit.config';
import { STAGES } from '@/config/stages.config';
import {
  resolveRecruitState,
  daysLeft,
  formatDeadline,
} from '@/lib/recruit';

// 상태 판정이 빌드 시점에 굳지 않도록 주기적으로 재생성한다.
// 모집 기간에는 1시간이다. 하루로 두면 마감 당일에 이미 닫혔는데도
// "마감까지 1일"이 최대 하루 동안 남아 있을 수 있다.
export const revalidate = 3600;

export default function Home() {
  const now = new Date();
  const state = resolveRecruitState(RECRUIT, now);
  const left = daysLeft(RECRUIT, now);

  return (
    <>
      {/* clipPath 정의는 페이지에 한 번만 */}
      <ShapeDefs shapes={STAGES.map((s) => s.shape)} />
      <NavBar />
      <main>
        <Hero state={state} daysLeft={left} />
        <IntroSection />
        {STAGES.map((stage, i) => (
          <Stage key={stage.slug} data={stage} index={i} />
        ))}
      </main>
      <Footer />
      <RecruitToolbar state={state} deadline={formatDeadline(left)} />
    </>
  );
}
