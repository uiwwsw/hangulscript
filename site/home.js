// Preserve existing shared programs and bookmarks after moving the editor.
if (location.hash.startsWith('#code=') || location.hash === '#playground') {
  location.replace('/playground/' + (location.hash.startsWith('#code=') ? location.hash : ''));
} else if (location.hash === '#frameworks') {
  location.replace('/docs/frameworks/');
} else if (location.hash === '#guide') {
  location.replace('/docs/language/');
}
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(button.dataset.copy); button.textContent = '복사됨'; }
    catch { button.textContent = '직접 선택해 복사'; }
  });
}
