const expected = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(expected ?? '')) throw new Error('Expected a stable extension version');
const url = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';
// Validation and search propagation are asynchronous. Never report submission as public success.
for (let attempt = 0; attempt < 24; attempt++) {
  try {
    const response = await fetch(url, {
      method: 'POST', signal: AbortSignal.timeout(20000),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json;api-version=7.2-preview.1' },
      body: JSON.stringify({ filters: [{ criteria: [{ filterType: 7, value: 'uiwwsw.hangulscript-vscode' }] }], flags: 914 })
    });
    if (!response.ok) throw new Error(`Gallery returned HTTP ${response.status}`);
    const data = await response.json();
    const extension = data.results?.flatMap(result => result.extensions ?? []).find(item => item.extensionName === 'hangulscript-vscode' && item.publisher?.publisherName === 'uiwwsw');
    if (extension?.versions?.some(item => item.version === expected)) {
      console.log(`Public Marketplace version verified: uiwwsw.hangulscript-vscode@${expected}`);
      process.exit(0);
    }
    console.log(`Waiting for Marketplace validation (${attempt + 1}/24)`);
  } catch (error) { console.log(`Marketplace verification retry: ${error.message}`); }
  if (attempt < 23) await new Promise(resolve => setTimeout(resolve, 30000));
}
throw new Error('Marketplace public version is not visible yet. Check publisher validation status; do not bump the version just to retry.');
