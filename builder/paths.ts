import path from 'node:path';

export const sourceDir = path.resolve(import.meta.dirname, '../src');
export const outputDir = path.resolve(import.meta.dirname, '../dist');
export const extensionDir = path.join(outputDir, 'extension');
