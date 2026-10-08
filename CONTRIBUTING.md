# 개발 설정 / Development setup

## 한국어

`npm ci`로 저장소에 고정된 도구 버전을 설치하세요. Oxlint는 코드 규칙을 검사하고,
Prettier는 포맷을 담당합니다. Prettier 기본값에 줄 너비만 100자로 설정합니다.

VS Code에서는 권장 Prettier 확장을 설치하세요. 이 저장소의 `.vscode/settings.json`이
저장 시 포맷터를 지정하고 ESLint 자동 수정을 비활성화합니다. 다른 프로젝트의 개인 설정은 바꾸지 않습니다.
언어별 개인 설정이나 다른 확장으로 결과가 다르면 저장소 설정과 포맷터 출력 로그를 확인하세요.
다른 에디터에서도 저장소의 Prettier 버전과 설정을 사용하세요.

- `npm run format`: 공통 규칙으로 포맷
- `npm run format:check`: 파일 변경 없이 포맷 검사
- `npm run lint`: Oxlint 검사
- `npm run check`: CI와 동일한 전체 검증

기존 파일은 처음 한 번 포맷 정리가 필요합니다. 정리 후 동일한 포맷터를 반복 실행하면
추가 변경이 생기지 않습니다. 수동 수정에 따라 필요한 줄바꿈은 생길 수 있습니다.
빌드 결과·로컬 확인 파일·lockfile은 포맷 대상에서 제외합니다.

## English

Run `npm ci` to install the repository's pinned tool versions. Oxlint checks code rules;
Prettier handles formatting with its defaults and a print width of 100.

In VS Code, install the recommended Prettier extension. Workspace settings select the
formatter on save and disable ESLint fixes for this repository without changing global settings.
If language-specific user settings or other extensions produce different results, check the
workspace settings and formatter output. Other editors should use the same local Prettier version
and repository configuration.

- `npm run format`: apply formatting
- `npm run format:check`: check formatting without modifying files
- `npm run lint`: run Oxlint
- `npm run check`: run the same validation as CI

Existing files need a one-time formatting pass. Repeating the formatter afterward should produce
no further changes, though edits can still cause necessary line wrapping. Build output, local
verification files, and the lockfile are excluded from formatting.
