import { defineConfig } from 'tsup';
import { copy } from './src';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  tsconfig: 'tsconfig.json',
  dts: true,
  clean: true,
  sourcemap: false,
  esbuildPlugins: [copy({ from: 'sample', to: 'sample-output' })],
  // esbuildPlugins: [copy({ from: 'sample/sample.json', to: 'sample-output'})],
});
