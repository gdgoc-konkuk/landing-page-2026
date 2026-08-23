import Icon from '../ui/Icon';
import { globe, instagram, github, mail } from '@/lib/icons';

/**
 * Ft5 Statement footer. 히어로의 primary 색 필드를 반복하지 않고
 * surface-container-high 위에서 문장과 CTA의 역할 대비로 페이지를 닫는다.
 *
 * 4열 링크 + 소셜 아이콘 행 + 작은 저작권 꼬리(가장 알아보기 쉬운 AI 푸터 지문)를
 * 쓰지 않는다. 실제로 존재하는 채널만, 한 줄로.
 */
const LINKS = [
  {
    label: 'GDG 챕터 페이지',
    href: 'https://gdg.community.dev/gdg-on-campus-konkuk-university-seoul-south-korea/',
    icon: globe,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/gdgoc.konkuk',
    icon: instagram,
  },
  { label: 'GitHub', href: 'https://github.com/gdgoc-konkuk', icon: github },
  {
    label: 'gdgoc.konkuk@gmail.com',
    href: 'mailto:gdgoc.konkuk@gmail.com',
    icon: mail,
  },
];

export default function Footer() {
  return (
    <footer className="bg-surface-container-high text-on-surface">
      <div className="mx-auto max-w-6xl px-[clamp(1rem,4vw,1.5rem)] pt-[clamp(4rem,10vw,7rem)] pb-24">
        <p className="m3-display-emphasized text-primary max-w-[20ch]">
          Share and Challenge, Together!
        </p>

        <p className="m3-body-large text-on-surface-variant mt-6">
          Google Developer Groups on Campus Konkuk
        </p>

        {/* 이 항목들은 보조 행동 chip이 아니라 외부 내비게이션이다.
            일반 링크의 underline + 아이콘으로 역할을 정확히 드러낸다. */}
        <ul className="border-outline mt-[clamp(3rem,7vw,5rem)] flex flex-wrap gap-x-6 gap-y-2 border-t pt-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                {...(l.href.startsWith('mailto:')
                  ? {}
                  : { target: '_blank', rel: 'noopener noreferrer' })}
                className="m3-label-large text-on-surface-variant hover:text-primary active:text-primary decoration-outline hover:decoration-primary active:decoration-primary inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap underline underline-offset-4 transition-colors duration-150"
              >
                <Icon data={l.icon} size={20} />
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="m3-body-medium text-on-surface-variant mt-8">
          © {new Date().getFullYear()} GDGoC Konkuk
        </p>
      </div>
    </footer>
  );
}
