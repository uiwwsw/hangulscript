import { marked } from 'marked';
import ts from 'typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { sentenceRuntime } from '../src/runtime.js';
import { standardCatalog } from './standard-catalog.js';
export const docPages = [
 ['','공식 문서','한글스크립트의 문법·표준 기능·도구를 한곳에서 확인하세요.',null],
 ['start','시작하기','설치부터 첫 .hgs 실행과 JavaScript 빌드까지.','docs/guides/start.md'],
 ['language','문법 안내','변수·함수·흐름·클래스·타입을 문장형으로 표현합니다.','LANGUAGE.md'],
 ['collections','자료구조 고르기','목록·집합·사전·복사·정렬의 차이를 이해합니다.','docs/guides/collections.md'],
 ['modules','모듈과 Node','파일을 나누고 JavaScript와 타입 선언으로 배포합니다.','docs/guides/modules.md'],
 ['frameworks','React·Vue','Vite에서 한글스크립트 모듈을 연결하고 빌드합니다.','docs/frameworks.md'],
 ['vscode','VS Code','ㅎ 파일 아이콘·포맷·진단·자동 완성을 설정합니다.','extensions/vscode/README.md'],
 ['errors','오류 해결','문법과 타입 오류를 원본 위치에서 읽고 해결합니다.','docs/guides/errors.md'],
 ['writing','문장과 설계','이름·타입·조건·결과가 분명한 문장으로 개발합니다.','docs/guides/writing.md'],
 ['roadmap','큰 그림과 로드맵','현재 지원·부분 지원·미구현과 앞으로의 개발 순서.','docs/ROADMAP.md'],
 ['support','지원 범위','지원 환경·제약·호환성 정책을 확인합니다.','docs/support.md'],
 ['publishing','npm 게시','Actions Secret으로 검증한 릴리스를 게시합니다.','docs/publishing.md'],
 ['standard-library','표준 기능 전체',`${standardCatalog.length}개 한글 기본 함수의 타입·동작·실행 예제.`,null]
];
export const categories = [['기본','basics'],['목록','lists'],['집합','sets'],['사전','maps'],['복사','copy'],['정렬','sorting'],['숫자','numbers'],['문자열','strings'],['검증','checks'],['화면','ui']];
for (const [category,slug] of categories) docPages.push(['library/'+slug,category+' 함수',category+' 기능의 입력·반환값·예제·원본 변경 여부.',null]);
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const route = slug => '/docs/'+(slug?slug+'/':'');
const runtime = ts.createSourceFile('runtime.ts',sentenceRuntime,ts.ScriptTarget.Latest,true);
const signatures = new Map();
const declarations = new Map();
for (const node of runtime.statements.filter(ts.isFunctionDeclaration)) {
 const name=node.name.text; if(!declarations.has(name))declarations.set(name,[]); declarations.get(name).push(node);
}
for(const [name,nodes] of declarations){
 const chosen=nodes.some(n=>!n.body)?nodes.filter(n=>!n.body):nodes;
 signatures.set(name,chosen.map(node=>node.getText(runtime).slice(0,node.body?node.body.getStart(runtime)-node.getStart(runtime):undefined).replace(/^function /,'').trim().replace(/;$/,'')).join('\n'));
}
export async function buildDocs(origin,output='site-dist') {
 const search=[];
 for (let index=0;index<docPages.length;index++) {
  const [slug,title,description,file]=docPages[index];
  const isLibrary=slug==='standard-library'||slug.startsWith('library/');
  let content='';
  if(file) content=marked.parse(await readFile(file,'utf8'),{walkTokens(token){
   if(token.type!=='link'||/^(?:[a-z]+:|#|\/)/i.test(token.href))return;
   const [filename,hash]=token.href.split('#');
   const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),filename));
   const known=docPages.find(p=>p[3]===resolved);
   token.href=(known?route(known[0]):'https://github.com/uiwwsw/hangulscript/blob/main/'+resolved)+(hash?'#'+hash:'');
  }});
  else if(isLibrary) {
   const category=categories.find(([,key])=>slug==='library/'+key)?.[0];
   content=`<h1>${escape(title)}</h1><p class="lead">${escape(description)} 기본 이름은 같은 파일의 최상위 선언에서 중복 정의하지 마세요. 타입 표기는 내부 TypeScript 서명이며 실행 예제는 문장형 HGS입니다.</p>`;
   for(const item of standardCatalog.filter(r=>!category || r.category===category)) {
    const code=Buffer.from(item.example).toString('base64');
    content+=`<section class="api-card" id="${escape(item.name)}"><p class="eyebrow">${escape(item.category)}</p><h2>${escape(item.name)}</h2><p>${escape(item.summary)}</p><pre class="signature"><code>${escape(signatures.get(item.name))}</code></pre><p class="api-note">${escape(item.notes)}</p><pre><code class="language-hgs">${escape(item.example)}</code></pre><a class="example-link" href="/#code=${code}">실행 화면에서 열기 ↗</a></section>`;
    if(slug!=='standard-library') search.push({title:item.name+' · '+item.category,description:item.summary,url:route(slug)+'#'+encodeURIComponent(item.name)});
   }
  } else content=`<h1>한글로 쓰고, 정확하게 실행하세요.</h1><p class="lead">한글스크립트 0.8의 공식 문서입니다. 문법을 배우고, 자료구조를 고르고, 기존 프로젝트와 연결하세요. 예제는 첫 줄부터 문장형으로 작성합니다.</p><div class="doc-grid">${docPages.filter(p=>p[0] && !p[0].startsWith('library/')).map(([s,t,d])=>`<a href="${route(s)}"><h2>${escape(t)}</h2><p>${escape(d)}</p><span>읽기 ↗</span></a>`).join('')}</div><h2>표준 기능 찾아보기</h2><p>전체 ${standardCatalog.length}개 함수의 입력 타입·반환값·복사와 변경 규칙을 설명합니다.</p><div class="category-links">${categories.map(([t,s])=>`<a href="/docs/library/${s}/">${t}</a>`).join('')}</div>`;
  search.push({title,description,url:route(slug)});
  const nav=docPages.map(([s,t])=>`<a href="${route(s)}" ${s===slug?'aria-current="page"':''}>${s.startsWith('library/')?'↳ ':''}${escape(t)}</a>`).join('');
  const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · 한글스크립트 문서</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin+route(slug)}"><meta property="og:title" content="${escape(title)} · 한글스크립트"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${origin+route(slug)}"><meta property="og:type" content="article"><meta property="og:image" content="${origin}/og.png"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#173d35"><link rel="icon" href="/icon.svg"><link rel="stylesheet" href="/docs.css"><script type="module" src="/docs.js"></script><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'TechArticle',headline:title,description,inLanguage:'ko',url:origin+route(slug),isPartOf:{'@type':'WebSite',name:'한글스크립트',url:origin}}).replaceAll('<','\\u003c')}</script></head><body><a class="skip" href="#content">본문으로 이동</a><header class="docs-header"><a class="brand" href="/">ㅎ <span>한글스크립트</span><small>0.8 문서</small></a><nav><a href="/#playground">실행하기</a><a href="https://github.com/uiwwsw/hangulscript">GitHub ↗</a></nav></header><div class="docs-layout"><aside><label for="docs-search">문서·함수 검색</label><input id="docs-search" type="search" placeholder="예: 정렬, 깊게복사" autocomplete="off"><div id="search-results" role="region" aria-label="검색 결과" aria-live="polite"></div><details class="docs-menu" open><summary>문서 목차</summary><nav aria-label="문서 목차">${nav}</nav></details></aside><main id="content"><div class="breadcrumb"><a href="/docs/">문서</a><span>/</span>${escape(title)}</div><article>${content}</article><footer class="doc-footer"><a href="https://github.com/uiwwsw/hangulscript/issues">문서 개선 제안 ↗</a><span>언어 0.8 · VS Code 0.3</span></footer></main></div></body></html>`;
  const directory=path.join(output,route(slug));await mkdir(directory,{recursive:true});await writeFile(path.join(directory,'index.html'),html);
 }
 await writeFile(path.join(output,'docs-index.js'),'export default '+JSON.stringify(search)+';\n');
 return docPages.map(([slug])=>route(slug));
}
