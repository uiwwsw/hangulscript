import index from '/docs-index.js';
const search=document.getElementById('docs-search');
const results=document.getElementById('search-results');
search?.addEventListener('input',()=>{
 results.replaceChildren();const query=search.value.trim().toLocaleLowerCase('ko');if(!query)return;
 const found=index.filter(item=>(item.title+' '+item.description).toLocaleLowerCase('ko').includes(query)).slice(0,12);
 if(!found.length){const p=document.createElement('p');p.textContent='일치하는 문서가 없습니다. 다른 이름으로 찾아보세요.';results.append(p);}
 for(const item of found){const a=document.createElement('a');a.href=item.url;a.textContent=item.title;const small=document.createElement('small');small.textContent=item.description;a.append(small);results.append(a);}
});
if(matchMedia('(max-width:900px)').matches)document.querySelector('.docs-menu')?.removeAttribute('open');
for(const pre of document.querySelectorAll('pre:not(.signature)')){
 const code=pre.querySelector('code');if(!code)continue;
 const button=document.createElement('button');button.type='button';button.className='copy-code';button.textContent='복사';button.setAttribute('aria-label','코드 복사');
 button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code.textContent);button.textContent='복사됨';}catch{button.textContent='직접 선택해 복사';}});pre.append(button);
}
