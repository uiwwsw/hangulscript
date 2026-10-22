# 한글스크립트 for VS Code

`.hgs` 파일의 문법 강조, 자동 들여쓰기, 문서 포맷과 문법·타입 오류 표시를 제공합니다. 컴파일러와 같은 검사기를 사용하며 코드를 실행하지 않습니다. 별도 npm 설치 없이 동작합니다. 타입 정보 표시, 정의로 이동, 스코프 이름 자동 완성과 문장형 스니펫도 제공합니다.

## 설치와 포맷

VS Code에서 확장 ID `uiwwsw.hangulscript-vscode`를 검색하거나 [Marketplace 페이지](https://marketplace.visualstudio.com/items?itemName=uiwwsw.hangulscript-vscode)를 엽니다. VSIX를 받은 경우 Extensions 메뉴의 **Install from VSIX…**로 설치할 수 있습니다. `.hgs` 문서를 열고 **Format Document**를 실행하세요. 저장할 때 적용하려면 프로젝트 `.vscode/settings.json`에 다음을 추가합니다.

```json
{
  "[hangulscript]": {
    "editor.defaultFormatter": "uiwwsw.hangulscript-vscode",
    "editor.formatOnSave": true,
    "editor.tabSize": 4,
    "editor.insertSpaces": true
  }
}
```

포맷터는 들여쓰기 폭, 줄 끝 공백과 빈 줄을 정리합니다. 식과 문자열은 다시 쓰지 않습니다. 들여쓰기가 문법적으로 잘못된 코드는 구조를 추측해 변경하지 않으므로 먼저 표시된 오류를 고치세요. 오류는 Problems 패널과 원본 문서의 밑줄로 표시됩니다. 열려 있는 파일의 미저장 변경과 상대 경로 `.hgs` import도 검사합니다.

자동 완성은 현재 스코프의 이름과 문장형 스니펫을 제공합니다. 전체 속성 자동 완성·자동 import·이름 변경·디버거·브라우저용 VS Code는 아직 지원하지 않습니다. 입력 타입이 `any`이면 TypeScript와 마찬가지로 해당 값의 엄격한 검사가 제한됩니다.

## 개발 및 배포

언어와 확장은 같은 저장소에서 관리하고 버전은 독립적으로 올립니다. 저장소 루트에서 `npm ci`, `npm run build:vscode`, `npm run package:vscode` 순서로 빌드합니다. VSIX는 확장 디렉터리에 생성됩니다. `npm run test:vscode`는 실제 VS Code의 별도 테스트 프로필에서 포맷·진단·타입 정보·정의 이동·자동 완성을 검증합니다.

Marketplace 게시 전 `package.json`의 publisher를 실제 소유한 게시자 ID로 확인해야 합니다. 공식 게시자 ID는 `uiwwsw`입니다. [공식 게시 안내](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)에 따라 게시자를 등록하고 인증한 뒤 VSIX를 업로드합니다. VSIX 생성과 Marketplace 공개는 별도 단계입니다.
