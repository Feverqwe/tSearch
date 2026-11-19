import {defineConfig} from 'vite';

export default defineConfig({
  optimizeDeps: {entries: ['index.html']},
  server: {
    fs: {
      deny: [
        '.env',
        '.env.*',
        '*.{crt,pem,key,p12,pfx,cer,der}',
        '.npmrc',
        '.yarnrc.yml',
        '**/.git/**',
        '**/tools/model-training/*/assets/**',
      ],
    },
  },
});
