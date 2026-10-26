import { build } from 'esbuild';
import { buildDocs } from './build-docs.js';
import { typeLibraries } from './type-libraries.js';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
const origin = process.env.SITE_URL || 'https://hangulscript.vercel.app';
if (!/^https:\/\/[a-z0-9.-]+$/i.test(origin)) throw new Error('SITE_URL must be an HTTPS origin');
await rm('site-dist', { recursive: true, force: true });
await mkdir('site-dist');
await cp('site', 'site-dist', { recursive: true });
await build({ entryPoints: ['site/home.js', 'site/app.js', 'site/compiler-worker.js', 'site/runner.js'], bundle: true, minify: true, format: 'esm', platform: 'browser', outdir: 'site-dist', external: ['/type-libs.js'] });
await writeFile('site-dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
const docRoutes=await buildDocs(origin);
docRoutes.push("/en/", "/playground/");
await writeFile('site-dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url>${docRoutes.map(route=>`<url><loc>${origin}${route}</loc></url>`).join('')}</urlset>`);
const { readFile } = await import('node:fs/promises');
await writeFile('site-dist/index.html', (await readFile('site/index.html', 'utf8')).replaceAll('https://hangulscript.vercel.app', origin));

await writeFile('site-dist/type-libs.js', 'export default ' + JSON.stringify(await typeLibraries()) + ';\n');

await writeFile('site-dist/en/index.html', (await readFile('site/en/index.html', 'utf8')).replaceAll('https://hangulscript.vercel.app', origin));

await writeFile('site-dist/playground/index.html', (await readFile('site/playground/index.html', 'utf8')).replaceAll('https://hangulscript.vercel.app', origin));

const escapeUsagePath=path=>Array.from(path,char=>'.?+*^$[]\\(){}|'.includes(char)?'\\'+char:char).join('');
const usageConfig={service:'koreanscript',origin,hosts:[new URL(origin).hostname],routes:['/',...docRoutes].map(path=>({match:path==='/'?'^/$':`^${escapeUsagePath(path.slice(0,-1))}/?$`,path,name:path.split('/').filter(Boolean).join('_').replaceAll('-','_')||'home'})),sections:{features:'features',start:'start'},outbound:[{url:'https://github.com/uiwwsw/hangulscript',name:'github'},{url:'https://www.npmjs.com/package/@uiwwsw/hangulscript',name:'npm'}]};
const usageAttr=JSON.stringify(usageConfig).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const usageTag=`<script type="module" src="/usage-analytics.js" data-usage-config="${usageAttr}"></script>`;
// Only authored page routes receive analytics; the execution frame stays isolated.
for(const path of ['/',...docRoutes]) {
 const file=`site-dist${path}index.html`;
 await writeFile(file,(await readFile(file,'utf8')).replace('</head>',()=>usageTag+'</head>'));
}
