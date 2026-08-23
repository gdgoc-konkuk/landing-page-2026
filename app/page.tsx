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

// 상태 판정이 빌드 시점에 굳지 않도록 하루에 한 번 재생성한다.
export const revalidate = 86400;

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
