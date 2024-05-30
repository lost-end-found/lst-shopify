import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // vite config
    build: {
      // generate manifest.json in outDir
      outDir: 'assets',
      assetsDir: 'dist',
      emptyOutDir: false,
      manifest: false,
      rollupOptions: {
        // overwrite default .html entry
        input: [
          './src/js/component-product-slideshow.js',
          './src/js/component-carousel-swipe-content.js',
          './src/js/component-carousel.js',
          './main.js',
          './src/css/component-carousel.css',
          './src/css/component-product-slideshow.css',
        ],
        output: {
          entryFileNames: '[name]-vite.js',
          assetFileNames: '[name]-vite.[ext]',
        },
      },
      watch: {
        // watch files in the following directories
        include: ['src/js/*', 'src/css/*', 'style.css', '**/*.liquid'],
        // do not watch files in the following directories
        exclude: ['node_modules', 'dist', 'public', 'build'],
        // use chokidar options
        //       buildDelay?: number;
        // chokidar?: ChokidarOptions;
        // clearScreen?: boolean;
        // exclude?: string | RegExp | (string | RegExp)[];
        // include?: string | RegExp | (string | RegExp)[];
        // skipWrite?: boolean;
        // skipWrite: true,

        chokidar: {
          ignored: [
            '**/node_modules/**',
            '**/dist/**',
            '**/assets/**',
            '**/public/**',
            '**/build/**',
            '**/dist-new/**',
            '**/dist-new-2/**',
          ],
        },
      },
    },
  };
});
