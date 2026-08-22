/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' 및 images.unoptimized 제거.
  // 이유: next/image 최적화 + ISR revalidate(모집 상태 전환) 확보.
  // 되돌리지 말 것 — 둘을 동시에 잃는다.
};

export default nextConfig;
