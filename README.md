# esbuild-copy-files

A lightweight esbuild plugin for copying files or directories during builds.

## Install

```bash
pnpm add -D @amoklab/esbuild-copy-files esbuild
```

## Usage

### esbuild

```ts
import { build } from 'esbuild';
import { copy } from '@amoklab/esbuild-copy-files';

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  plugins: [copy([{ from: 'sample', to: 'dist/sample' }])],
});
```

### tsup

```ts
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
});
```

You can copy either a single file or an entire directory. If the source is a directory, its contents are copied recursively.

## Available API

### copy(options)

Creates an esbuild plugin instance.

```ts
copy(options: CopyPluginOptions | CopyPluginOptions): Plugin
```

### CopyPluginOptions

```ts
interface CopyPluginOptions {
  from: string;
  to: string;
  on?: 'onStart' | 'onEnd' = 'onEnd';
}
```

#### Options

- `from`: Source file or directory to copy.
- `to`: Destination file or directory.
- `on`: When to run the copy step. Defaults to `onEnd`.

## Notes

- The plugin uses esbuild lifecycle hooks
