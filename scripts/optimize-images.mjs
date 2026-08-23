// 원본을 제자리에서 재인코딩한다. next/image가 AVIF/WebP 변환과 srcset을
// 담당하므로 원본은 "적정 해상도의 고품질 1본"만 유지하면 된다.
//
// sharp는 devDependencies에만 있다 — 이 스크립트를 실행하는 개발자 도구용이며
// 런타임(Vercel)에는 필요 없다. yarn 1(classic)의 optional-dependency 처리가
// 신뢰할 수 없어 sharp의 네이티브 플랫폼 바이너리가 깨진 상태로 설치될 수 있다.
// 이 경우에도 `@img/sharp-*` 플랫폼 패키지를 package.json에 직접 추가하지 말 것 —
// Task 1에서 Critical 이슈로 되돌려진 조치다. 필요하면 `yarn install`을 재시도하거나
// 로컬 sharp 설치를 정리 후 재설치한다.
import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'public/images';
const MAX_WIDTH = 2000;   // 히어로 full-bleed 기준. 이보다 큰 원본은 불필요
const QUALITY = 78;
const TARGET_MAX_BYTES = 300 * 1024;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let before = 0, after = 0, touched = 0;
const failed = [];

for await (const file of walk(ROOT)) {
  if (!/\.(webp|png|jpe?g)$/i.test(file)) continue;

  const tmp = `${file}.tmp.webp`;
  try {
    const { size: sizeBefore } = await stat(file);
    before += sizeBefore;

    const img = sharp(file, { failOn: 'none' });
    const meta = await img.metadata();
    const width = meta.width && meta.width > MAX_WIDTH ? MAX_WIDTH : undefined;

    await sharp(file, { failOn: 'none' })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(tmp);

    const { size: sizeAfter } = await stat(tmp);

    if (sizeAfter < sizeBefore) {
      const target = file.replace(/\.(png|jpe?g)$/i, '.webp');
      if (target !== file) await unlink(file);
      await rename(tmp, target);
      after += sizeAfter;
      touched++;
      const flag = sizeAfter > TARGET_MAX_BYTES ? '  ⚠ 300KB 초과' : '';
      console.log(
        `${target}  ${(sizeBefore / 1024).toFixed(0)}KB → ${(sizeAfter / 1024).toFixed(0)}KB${flag}`
      );
    } else {
      await unlink(tmp);
      after += sizeBefore;
      console.log(`${file}  변화 없음 (건너뜀, 재압축이 더 큼)`);
    }
  } catch (err) {
    await unlink(tmp).catch(() => {});
    failed.push({ file, error: err.message });
    console.error(`${file}  실패: ${err.message}`);
  }
}

console.log(
  `\n합계: ${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024 / 1024).toFixed(1)}MB  (${touched}개 변환)`
);

if (failed.length > 0) {
  console.error(`\n실패한 파일 ${failed.length}개:`);
  for (const { file, error } of failed) {
    console.error(`  - ${file}: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('실패한 파일 없음');
}
