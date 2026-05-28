import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'StingrayGame',
          fileName: 'stingray-game',
          formats: ['es'],
        },
        outDir: 'dist',
        emptyOutDir: true,
      },
    };
  }
  return {
    base: './',
  };
});
