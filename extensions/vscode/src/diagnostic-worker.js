import { parentPort, workerData } from 'node:worker_threads';
import { checkSource } from '../../../src/checker.js';
import { inspectSource } from '../../../src/editor.js';
parentPort.on('message', ({ id, files, method, filePath, line, column }) => {
  try {
    const settings = { files, allFiles: true, libDirectory: workerData.libDirectory };
    if (method === 'inspect') {
      const source=files.find(([name])=>name===filePath)?.[1];
      parentPort.postMessage({ id, method, result: inspectSource(source, filePath, line, column, settings) });
    } else {
      const result = checkSource(files[0][1], files[0][0], settings);
      parentPort.postMessage({ id, diagnostics: result.diagnostics });
    }
  } catch (error) { parentPort.postMessage({ id, method, error: error.message }); }
});
