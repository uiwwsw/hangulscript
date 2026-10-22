import type { CheckSettings } from './index.js';
export interface EditorLocation { filePath: string; line: number; column: number; length: number; }
export interface EditorInspection { hover?: string; definitions: EditorLocation[]; completions: { name: string; detail: string }[]; }
/** One-based UTF-16 positions. Does not execute source. */
export function inspectSource(source: string, filePath: string, line: number, column: number, settings?: CheckSettings): EditorInspection;
