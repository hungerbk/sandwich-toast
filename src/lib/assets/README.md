# 재료 이미지 에셋

한국어 | [English](README.en.md)

## 파일 구성

재료마다 `{ingredient}.webp` 파일 하나를 사용합니다. 현재는 이미지 타일을
겹치고 실루엣에 맞춰 자르는 방식이며, 사선 분할 배치는 #6에서 별도로 다룹니다.

- `lettuce.webp`: success · 상추 · 556×562
- `tomato.webp`: error · 토마토 · 499×400
- `cheese.webp`: warning · 치즈 · 450×400
- `bread.webp`: info · 빵 · 800×200
- `scrambled.webp`: loading · 스크램블 에그 · 800×200

각 이미지는 여백 없이 재료에 맞춰 잘려 있어 크기가 다릅니다.
`Ingredient.tsx`에서는 빵과 에그를 단일 레이어로 표시하고,
상추·토마토·치즈는 이미지 4개를 겹쳐 표시합니다.
각 타일에 조금씩 다른 회전과 축소를 적용해 재료를 가로로 늘이지 않고 카드 폭을 채웁니다.

## 케첩 오버레이

`ketchup.webp`는 에그와 같은 800×200 캔버스를 사용합니다(#12).
에그에만 사용하지는 않으며, `isLoading`일 때 현재 재료 위에 표시됩니다.
clip-path로 짜기·유지·지우기 애니메이션을 반복합니다.
다른 재료에도 재사용하고 독립적으로 움직일 수 있도록 별도 파일로 유지합니다.

로딩 외 토스트에서는 `ketchup: true`로 정적인 케첩을 표시합니다.
로딩 토스트는 이 옵션과 무관하게 케첩을 표시하며, 모션 감소 설정에서는 애니메이션을 멈춥니다.

## 압축과 번들 측정 (#40)

이미지 6개를 라이브러리 JavaScript에 인라인하는 방식을 유지합니다.
재료 5개는 해상도를 변경하지 않고 Sharp의 WebP `quality: 80`,
`alphaQuality: 100`, `effort: 6`으로 재압축했습니다.
디코딩한 알파 채널은 원본과 동일합니다.
케첩은 재압축하면 19,346에서 21,962 bytes로 커져 원본을 유지했습니다.

추후 압축 비교에는 `3662e73` 커밋의 원본을 사용하세요.
이미 손실 압축한 파일을 반복해서 재압축하지 않습니다.

### 측정 결과

압축 전 → 후이며 단위는 bytes입니다.

- 빵: 67,692 → 8,366
- 치즈: 58,666 → 8,600
- 상추: 101,322 → 18,648
- 에그: 67,970 → 13,550
- 토마토: 84,226 → 13,290
- 케첩: 19,346 → 19,346
- 이미지 합계: 399,222 → 81,800 (79.5% 감소)
- ESM JavaScript: 556,149 → 132,917 / gzip: 407,318 → 91,015
- CJS JavaScript: 552,081 → 128,849 / gzip: 406,284 → 89,995

Node v24.13.0, Vite v8.1.5에서 `npm run build`로 생성한 실제 파일을 측정했습니다.
Gzip은 Vite 콘솔 추정값 대신 Node `zlib.gzipSync`의 기본 옵션을 사용합니다.
ESM과 CJS는 대체 형식이므로 브라우저 다운로드 용량으로 합산하지 않습니다.
타입 선언, 패키지 압축 파일, React, HTTP 헤더는 이 수치에서 제외합니다.

같은 조건으로 측정하려면 `npm ci`, `npm run build` 이후 다음 명령을 실행합니다.

```sh
node --input-type=module <<'JS'
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const assets = 'src/lib/assets/';
const imageBytes = readdirSync(assets)
  .filter(name => name.endsWith('.webp'))
  .reduce((total, name) => total + statSync(assets + name).size, 0);
console.log('WebP total:', imageBytes);
for (const name of ['sandwich-toast.es.js', 'sandwich-toast.cjs']) {
  const file = readFileSync('dist/' + name);
  console.log(name, { bytes: file.length, gzip: gzipSync(file).length });
}
JS
```

### 시각 품질 비교

원래 해상도의 품질 90(합계 107,124 bytes), 품질 80(재압축 케첩 포함 84,416 bytes),
해상도를 줄인 품질 90(89,672 bytes)을 비교했습니다.
축소 후보는 타일 폭을 최대 400px, 단일 레이어 폭을 600px로 제한했습니다.
검토자는 세 후보 사이에 눈에 띄는 차이를 느끼지 못했고,
품질 80을 실제 토스트에 적용한 뒤에도 크게 불편한 차이가 없다고 확인했습니다.
더 작은 원본 케첩을 유지한 최종 합계는 81,800 bytes입니다.

비교 페이지는 scale 0.5·1·1.5, 호버 확대 1.12배, 밝고 어두운 배경을 제공했습니다.
실제 확인 화면의 DPR은 기록하지 않아 모든 기기·DPR에서의 품질을 보장하는 검증은 아닙니다.
폭 320px 레이어를 scale 1.5·호버 확대·DPR 2에서 표시하면 1:1 픽셀 대응에
약 1,075px 원본 폭이 필요하며, 기존 800px 이미지도 이보다 작습니다.
따라서 추가 해상도 축소는 적용하지 않았습니다.

### 외부 파일과 미사용 재료 검토

임시 프로토타입은 WebP의 상대 import/require를 유지하고 라이브러리 옆에 이미지를 복사했습니다.
`base: '/sandwich-test/'`인 최소 Vite 소비 앱에서 비교한 결과입니다.

- 현재 인라인 ESM: JavaScript gzip 148,841 bytes
- 외부 ESM: JavaScript gzip 65,208 + 이미지 81,800 = 147,008 bytes
- 외부 CJS: JavaScript gzip 66,016 + 이미지 81,800 = 147,816 bytes

소비 앱의 React 코드를 포함하며, 이미지 6개를 추가 압축 없이 모두 전송한다고 가정한 합계입니다.
요청 부가 비용과 캐시는 제외하므로 실제 첫 화면의 전송량과 다를 수 있습니다.
생성된 이미지 경로는 설정한 base 아래의 출력 파일 6개와 일치했습니다.
CJS 실험에서는 임시 라이브러리가 node_modules 밖에 있어 Vite의 CommonJS 처리 범위에 명시적으로 추가했습니다.

외부 프로토타입을 Node에서 직접 불러오면 ESM의 WebP import와 CJS의 WebP require가 실패했습니다.
다른 외부화 설계까지 불가능하다는 뜻은 아니지만, 이 방식은 소비 앱의 에셋·SSR 처리와 연계가 필요합니다.
해당 프로토타입의 브라우저 요청과 설치된 패키지 호환성은 검증하지 않았습니다.

외부 파일은 적절한 HTTP 캐시 헤더와 안정적인 콘텐츠 해시가 있으면 독립 캐시가 가능합니다.
다만 전체 크기 차이가 작고 추가 연계가 필요하므로 외부화는 보류하고 인라인을 유지합니다.

`toast.success()`만 사용해도 이미지 6개가 모두 포함됩니다.
Toaster가 런타임 재료 맵과 로딩·케첩 옵션을 사용하기 때문입니다.
미사용 재료를 제거하려면 등록 방식·진입점·로딩 설계를 별도로 정해야 합니다.
현재의 간단한 사용법을 유지하기 위해 선택적 재료 구성은 보류합니다.

### 용량 예산

현재 기능을 기준으로 한 초기 검토 상한이며, 단위는 십진 bytes입니다.

- WebP 6개 합계: **90,000 bytes**
- ESM JavaScript: **145,000 bytes**, gzip **100,000 bytes**
- CJS JavaScript: **140,000 bytes**, gzip **100,000 bytes**

현재 측정값에 약 9~11% 여유를 둔 기준입니다. 추가 압축 목표가 아니라 용량 증가를 검토하는 상한입니다.
초과하면 원인과 시각 품질을 확인한 뒤 예산 변경을 판단하며, 통과만을 위해 품질을 낮추지 않습니다.
비교 시 동일한 lockfile과 Node 버전을 사용합니다. 자동 CI 검증은 #43에서 진행합니다.
