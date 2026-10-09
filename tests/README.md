# 테스트

**한국어** · [English](./README.en.md)

## 실행

`npm ci` 후 실행하세요. CI는 Node 24.13.0에서 모든 PR, main push 및 수동 실행을 검사합니다.

- `npm run check`: 포맷·린트·타입·테스트·라이브러리/데모 빌드·용량 검사. CI도 같은 명령을 사용합니다.
- `npm test`: 테스트를 한 번 실행합니다.
- `npm run test:watch`: 변경 시 테스트를 다시 실행합니다.
- `npm run typecheck`: 제품·테스트 코드의 타입을 검사합니다.
- `npm run check:size`: 빌드된 `dist`의 용량을 검사합니다. 먼저 `npm run build`를 실행하세요.

포맷 설정은 [개발 안내](../CONTRIBUTING.md), 용량 예산과 측정 기준은 [에셋 문서](../src/lib/assets/README.md#용량-예산)를 참고하세요. CI를 병합 필수 검사로 사용하려면 GitHub 브랜치 보호 설정에서 `check` 작업을 지정하세요.

## 자동 검증 범위

- **store·API**: 구독·snapshot, 기본값·옵션, duration 경계값, 삭제 인자 구분
- **생명주기**: 타이머 pause/resume/reset, 재정렬, 삭제 경합, 언마운트 정리
- **상호작용**: hover/focus/클릭, 방향키 탐색, 삭제 후 포커스 복원, 라벨 연결
- **표시 정책**: scale 보정, 개수 제한 없는 표시, 중복 Toaster의 개발 경고와 비차단
- **live region**: 초기 빈 영역, status/alert 분리, 노드 유지·추가·삭제
- **SSR·hydration**: Node 환경의 서버 렌더링·서버 API no-op, 클라이언트 DOM 유지·portal·nonce 전달
- **StrictMode**: 타이머·상호작용·hydration의 핵심 생명주기

공개 API에는 생성 후 duration 변경이나 Toaster의 초기 paused prop이 없습니다. 최초 paused는 훅의 경계조건으로, 공개 Toaster의 pause는 hover/focus 이벤트로 검증합니다.

## 자동화의 한계

jsdom은 실제 레이아웃이나 낭독을 검증하지 않습니다. 애니메이션은 mock으로 완료·취소를 제어하며 시각 효과를 확인하지 않습니다. Tab 탐색과 Enter/Space의 기본 클릭 동작도 자동 실행되지 않아, 해당 키를 가로채지 않는지만 검사합니다.

nonce 속성 전달은 확인하지만 실제 CSP 차단이나 Next.js RSC 통합 검증은 포함하지 않습니다. production 경고 분기는 환경 값을 바꿔 검사하며 실제 production React 번들 실행을 대신하지 않습니다.

## 수동 QA

- 320px 화면, 6개 위치, scale 0.5~1.5에서 카드·닫기 버튼·포커스 표시가 잘리지 않는지
- 긴 메시지·글자 확대에서 말줄임표, 버튼 겹침과 키보드 안내 배치
- Tab/Shift+Tab·방향키·Enter/Space, 삭제 후 포커스 이동과 마우스 hover 탐색
- 모션 감소 상태에서도 펼침·탐색·닫기가 가능한지
- 이미지 품질과 실제 CSP 환경에서 스타일·이미지 표시
- 스크린리더의 단일 알림 전달, 재정렬·삭제 시 불필요한 전체 재낭독 여부

live region의 DOM 검사는 낭독 누락·중복이 없음을 보장하지 않습니다. VoiceOver에서 확인된 연속 알림의 낭독 누락·중단은 별도 개선 이슈에서 다룹니다. 테스트 통과와 실제 브라우저 확인 결과를 구분해 기록하세요.
