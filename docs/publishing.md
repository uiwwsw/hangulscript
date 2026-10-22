# npm 자동 게시

게시 워크플로를 구성하는 기여자를 위한 설정 안내입니다. 인증 값은 저장소에 커밋하지 않고 CI의 비밀값 저장 기능으로 전달합니다. 아래 이름은 워크플로 입력 계약이며 운영 계정의 등록 여부나 현재 인증 상태를 나타내지 않습니다.

1. npm Access Tokens에서 만료 기간을 정하고 `@uiwwsw/hangulscript`에만 읽기·쓰기 권한을 부여합니다. 무인 게시에는 토큰의 게시용 2FA 우회 권한과 패키지의 해당 토큰 게시 허용 정책이 모두 맞아야 합니다. 계정 전체 2FA를 끄지 않습니다.
2. GitHub 저장소 Settings → Secrets and variables → Actions → New repository secret에서 이름을 `NPM_TOKEN`으로 등록합니다. 토큰 값은 채팅·이슈·문서에 붙이지 않습니다.
3. package.json 버전을 높여 커밋하고 동일한 `v버전` 태그의 GitHub Release를 게시합니다. 이미 존재하는 버전은 다시 게시할 수 없습니다.
4. `Publish npm package` 작업이 태그·패키지명·시크릿 존재를 검사하고 테스트·빌드 후 생성한 tarball을 provenance와 함께 게시합니다. 수동 실행은 동일한 릴리스 태그를 입력합니다. 시험판은 `next`, 정식 버전은 `latest` 태그를 사용합니다.
5. npm 공개 버전과 다운로드 체크섬을 확인합니다. 토큰이 만료되면 전용 토큰을 교체하고 같은 시크릿을 갱신합니다.

워크플로는 PR·브랜치 push로 게시되지 않습니다. npm 게시 권한은 게시 단계에만 전달하며 출력하지 않습니다. 토큰을 등록하지 않은 상태에서는 명확한 오류로 중단합니다.

토큰 보관을 없애려면 npm Trusted Publishing(OIDC)을 별도로 구성할 수도 있습니다. [npm 공식 토큰 안내](https://docs.npmjs.com/creating-and-viewing-access-tokens/) · [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)

## npm과 VS Code 확장 릴리스 분리

| 대상 | 버전 파일 | GitHub Release 태그 | 워크플로 |
| --- | --- | --- | --- |
| npm 언어 패키지 | 루트 `package.json` | `v0.8.1` 같은 `vX.Y.Z` | `publish.yml` |
| VS Code 확장 | `extensions/vscode/package.json` | `vscode-v0.3.2` 같은 `vscode-vX.Y.Z` | `publish-vscode.yml` |

표의 버전은 절차 예시입니다. 각 manifest와 정확히 일치하는 새 버전을 사용합니다. 확장 릴리스는 npm 게시를 실행하지 않고, npm 릴리스는 확장 게시를 실행하지 않습니다. PR과 일반 브랜치 push는 검증만 수행합니다.

### VS Code 확장 자동 게시

`Publish VS Code extension`은 전체 테스트·언어 빌드·문서 빌드·npm 패키지 검사와 실제 VS Code 호스트 테스트를 통과한 뒤 VSIX를 한 번 생성합니다. 게시 단계는 그 파일을 그대로 사용하며, VSIX와 SHA-256은 Actions 아티팩트로 보관합니다. Marketplace 검증은 비동기이므로 공개 갤러리에 버전이 나타나야 작업이 성공합니다. 제한 시간 내 공개되지 않으면 검증 상태를 확인한 후 같은 태그로 재실행합니다. 이미 게시된 버전은 덮어쓰지 않습니다.

1. 확장 버전과 변경 내역을 올려 main에 커밋합니다.
2. 그 커밋에 `vscode-vX.Y.Z` 태그를 생성하고 GitHub Release를 게시합니다.
3. 자동 게시 결과와 공개 Marketplace 버전을 확인합니다.

시험 실행은 Actions → **Publish VS Code extension** → **Run workflow**에서 기존 확장 태그를 입력하고 `dry_run`을 켭니다. 테스트·VSIX 생성·아티팩트 업로드까지 수행하며 게시 인증은 사용하지 않습니다. 수동으로 실제 게시하려면 같은 화면에서 `dry_run`을 끕니다. 언어 버전과 확장 버전은 독립적으로 관리합니다.

### 인증: OIDC 신뢰 배포

기본 명령은 `vsce publish --oidc`입니다. Marketplace에서 게시자 `uiwwsw`의 신뢰 배포 정책을 저장소 **uiwwsw/hangulscript**, 워크플로 **publish-vscode.yml**에 연결해야 합니다. 워크플로는 GitHub의 단기 OIDC 자격 증명을 사용하며 PAT로 자동 우회하지 않습니다. 신뢰 정책이 설정되지 않았다면 시험 실행은 가능하지만 실제 게시 인증은 실패합니다. 신뢰 정책 생성은 저장소에 게시 권한을 부여하는 별도의 계정 설정입니다.

[vsce 공식 신뢰 배포 안내](https://github.com/microsoft/vscode-vsce#trusted-publishing)를 기준으로 계정에서 제공되는 설정을 확인하세요. 직접 OIDC를 사용할 수 없는 계정은 [Microsoft Entra ID 배포](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#secure-automated-publishing-to-visual-studio-marketplace)를 별도로 구성할 수 있습니다. 현재 워크플로에는 Entra 로그인 단계를 포함하지 않습니다.

### 선택적 기존 인증: PAT

OIDC를 사용할 수 없고 PAT가 허용되는 계정이라면, Azure DevOps에서 **Marketplace (Manage)** 범위로 발급한 전용 토큰을 저장소 Actions Secret **VSCE_PAT**에 직접 등록하고 Actions Variable **VSCE_AUTH_MODE**를 `pat`으로 설정합니다. npm의 `NPM_TOKEN`과는 다른 자격 증명입니다. 토큰은 채팅에 보내지 않습니다. PAT가 없으면 명확한 오류로 중단하며, 기본 OIDC 모드에서는 PAT를 게시 명령에 전달하지 않습니다.

Microsoft는 전역 Azure DevOps PAT를 2026년 12월 1일 폐기한다고 안내하므로 새 구성은 OIDC를 우선합니다. 계정과 정책별 지원 범위는 [공식 게시 문서](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)를 확인하세요.
