import { parentPort, workerData } from 'node:worker_threads';
import { checkSource } from '../../../src/checker.js';
parentPort.on('message', ({ id, files }) => {
  try {
    const result = checkSource(files[0][1], files[0][0], { files, allFiles: true, libDirectory: workerData.libDirectory });
    parentPort.postMessage({ id, diagnostics: result.diagnostics });
  } catch (error) { parentPort.postMessage({ id, error: error.message }); }
});
