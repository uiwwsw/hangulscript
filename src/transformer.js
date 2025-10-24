const identifierCharRegex = /[\p{L}\p{N}_$]/u;

const KEYWORD_TRANSFORMS = [
  { match: "내보내기 기본내보내기", replacement: "export default", requiresBoundary: true },
  { match: "비동기함수", replacement: "async function", requiresBoundary: true },
  { match: "상수", replacement: "const", requiresBoundary: true },
  { match: "변수", replacement: "let", requiresBoundary: true },
  { match: "함수", replacement: "function", requiresBoundary: true },
  { match: "반환", replacement: "return", requiresBoundary: true },
  { match: "만약", replacement: "if", requiresBoundary: true },
  { match: "아니면", replacement: "else", requiresBoundary: true },
  { match: "반복", replacement: "for", requiresBoundary: true },
  { match: "동안", replacement: "while", requiresBoundary: true },
  { match: "참", replacement: "true", requiresBoundary: true },
  { match: "거짓", replacement: "false", requiresBoundary: true },
  { match: "비어있음", replacement: "null", requiresBoundary: true },
  { match: "정의안됨", replacement: "undefined", requiresBoundary: true },
  { match: "가져오기", replacement: "import", requiresBoundary: true },
  { match: "내보내기", replacement: "export", requiresBoundary: true },
  { match: "타입", replacement: "type", requiresBoundary: true },
  { match: "인터페이스", replacement: "interface", requiresBoundary: true },
  { match: "구현", replacement: "implements", requiresBoundary: true },
  { match: "확장", replacement: "extends", requiresBoundary: true },
  { match: "클래스", replacement: "class", requiresBoundary: true },
  { match: "생성자", replacement: "constructor", requiresBoundary: true },
  { match: "이것", replacement: "this", requiresBoundary: true },
  { match: "새로운", replacement: "new", requiresBoundary: true },
  { match: "대기", replacement: "await", requiresBoundary: true },
  { match: "시도", replacement: "try", requiresBoundary: true },
  { match: "잡기", replacement: "catch", requiresBoundary: true },
  { match: "던지기", replacement: "throw", requiresBoundary: true },
  { match: "문자열", replacement: "string", requiresBoundary: true },
  { match: "숫자", replacement: "number", requiresBoundary: true },
  { match: "불리언", replacement: "boolean", requiresBoundary: true },
  { match: "아무거나", replacement: "any", requiresBoundary: true },
  { match: "배열", replacement: "Array", requiresBoundary: true },
  { match: "레코드", replacement: "Record", requiresBoundary: true },
  { match: "맵", replacement: "Map", requiresBoundary: true },
  { match: "세트", replacement: "Set", requiresBoundary: true },
  { match: "약한맵", replacement: "WeakMap", requiresBoundary: true },
  { match: "약한세트", replacement: "WeakSet", requiresBoundary: true },
  { match: "프로미스", replacement: "Promise", requiresBoundary: true },
  { match: "객체", replacement: "Object", requiresBoundary: true },
  { match: "날짜", replacement: "Date", requiresBoundary: true },
  { match: "오류", replacement: "Error", requiresBoundary: true },
  { match: "정규식", replacement: "RegExp", requiresBoundary: true },
  { match: "제이슨", replacement: "JSON", requiresBoundary: true },
  { match: "수학", replacement: "Math", requiresBoundary: true },
  { match: "콘솔.출력", replacement: "console.log", requiresBoundary: false }
];

function isIdentifierBoundary(source, index) {
  if (index <= 0 || index >= source.length) {
    return true;
  }
  const char = source[index - 1];
  return !identifierCharRegex.test(char);
}

function isBoundaryAfter(source, index) {
  if (index >= source.length) {
    return true;
  }
  const char = source[index];
  return !identifierCharRegex.test(char);
}

function tryApplyTransform(source, index) {
  for (const transform of KEYWORD_TRANSFORMS) {
    if (!source.startsWith(transform.match, index)) {
      continue;
    }
    if (transform.requiresBoundary) {
      const beforeOk = isIdentifierBoundary(source, index);
      const afterOk = isBoundaryAfter(source, index + transform.match.length);
      if (!beforeOk || !afterOk) {
        continue;
      }
    }
    return {
      replacement: transform.replacement,
      length: transform.match.length
    };
  }
  return null;
}

function transformKeywords(source) {
  let result = "";
  let index = 0;
  const modeStack = ["code"];
  const templateExpressionStack = [];

  while (index < source.length) {
    const mode = modeStack[modeStack.length - 1];
    const char = source[index];

    if (mode === "code" || mode === "templateExpression") {
      if (mode === "templateExpression") {
        if (char === "}") {
          const info = templateExpressionStack[templateExpressionStack.length - 1];
          info.depth -= 1;
          result += char;
          index += 1;
          if (info.depth === 0) {
            templateExpressionStack.pop();
            modeStack.pop();
          }
          continue;
        }
        if (char === "{") {
          const info = templateExpressionStack[templateExpressionStack.length - 1];
          info.depth += 1;
          result += char;
          index += 1;
          continue;
        }
      }

      if (char === "\"") {
        modeStack.push("doubleQuote");
        result += char;
        index += 1;
        continue;
      }
      if (char === "'") {
        modeStack.push("singleQuote");
        result += char;
        index += 1;
        continue;
      }
      if (char === "`") {
        modeStack.push("template");
        result += char;
        index += 1;
        continue;
      }
      if (char === "/") {
        const next = source[index + 1];
        if (next === "/") {
          modeStack.push("lineComment");
          result += "//";
          index += 2;
          continue;
        }
        if (next === "*") {
          modeStack.push("blockComment");
          result += "/*";
          index += 2;
          continue;
        }
      }

      const transform = tryApplyTransform(source, index);
      if (transform) {
        result += transform.replacement;
        index += transform.length;
        continue;
      }

      result += char;
      index += 1;
      continue;
    }

    if (mode === "singleQuote") {
      result += char;
      index += 1;
      if (char === "\\") {
        if (index < source.length) {
          result += source[index];
          index += 1;
        }
        continue;
      }
      if (char === "'") {
        modeStack.pop();
      }
      continue;
    }

    if (mode === "doubleQuote") {
      result += char;
      index += 1;
      if (char === "\\") {
        if (index < source.length) {
          result += source[index];
          index += 1;
        }
        continue;
      }
      if (char === "\"") {
        modeStack.pop();
      }
      continue;
    }

    if (mode === "template") {
      result += char;
      index += 1;
      if (char === "\\") {
        if (index < source.length) {
          result += source[index];
          index += 1;
        }
        continue;
      }
      if (char === "`") {
        modeStack.pop();
        continue;
      }
      if (char === "$" && source[index] === "{") {
        result += "{";
        modeStack.push("templateExpression");
        templateExpressionStack.push({ depth: 1 });
        index += 1;
      }
      continue;
    }

    if (mode === "lineComment") {
      result += char;
      index += 1;
      if (char === "\n") {
        modeStack.pop();
      }
      continue;
    }

    if (mode === "blockComment") {
      result += char;
      index += 1;
      if (char === "*" && source[index] === "/") {
        result += "/";
        index += 1;
        modeStack.pop();
      }
      continue;
    }
  }

  return result;
}

function getLastNonWhitespaceChar(result) {
  for (let i = result.length - 1; i >= 0; i -= 1) {
    const char = result[i];
    if (char.trim() !== "") {
      return char;
    }
  }
  return "";
}

function fixClassMethods(source) {
  let result = "";
  let index = 0;
  const stack = [];
  let pendingClass = false;

  while (index < source.length) {
    if (source.startsWith("class", index) && isIdentifierBoundary(source, index) && isBoundaryAfter(source, index + 5)) {
      result += "class";
      index += 5;
      pendingClass = true;
      continue;
    }

    const char = source[index];

    if (char === "{") {
      result += char;
      index += 1;
      if (pendingClass) {
        stack.push("class");
        pendingClass = false;
      } else if (stack.length > 0) {
        stack.push(stack[stack.length - 1]);
      } else {
        stack.push("block");
      }
      continue;
    }

    if (char === "}") {
      result += char;
      index += 1;
      if (stack.length > 0) {
        stack.pop();
      }
      continue;
    }

    if (stack.includes("class")) {
      if (source.startsWith("async function", index) && isIdentifierBoundary(source, index) && isBoundaryAfter(source, index + "async function".length)) {
        const previous = getLastNonWhitespaceChar(result);
        if (previous === "" || "{;}.".includes(previous) || previous === "\n") {
          result += "async ";
          index += "async function".length;
          if (source[index] === " ") {
            index += 1;
          }
          continue;
        }
      }
      if (source.startsWith("function", index) && isIdentifierBoundary(source, index) && isBoundaryAfter(source, index + "function".length)) {
        const previous = getLastNonWhitespaceChar(result);
        if (previous === "" || "{;}.".includes(previous) || previous === "\n") {
          index += "function".length;
          if (source[index] === " ") {
            index += 1;
          }
          continue;
        }
      }
    }

    result += char;
    index += 1;
  }

  return result;
}

export function compileSource(source) {
  const keywordTransformed = transformKeywords(source);
  return fixClassMethods(keywordTransformed);
}
