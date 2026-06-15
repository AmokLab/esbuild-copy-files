import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';
import { basename, dirname, join, relative } from 'path';

import chokidar from 'chokidar';
import type { Plugin } from 'esbuild';

export interface CopyPluginOptions {
  from: string;
  to: string;
  on?: 'onStart' | 'onEnd';
  watch?: boolean;
}

const copyFiles = (from: string, to: string) => {
  if (!existsSync(from)) {
    throw new Error(`${from} does not exist`);
  }
  mkdirSync(dirname(to), { recursive: true });
  const isFromDirectory = existsSync(from) && statSync(from).isDirectory();
  const isToDirectory = existsSync(to) && statSync(to).isDirectory();

  if (isFromDirectory) {
    if (!isToDirectory) {
      throw new Error(`${to} is not a directory while ${from} is a directory`);
    }
    for (const file of readdirSync(from)) {
      copyFiles(`${from}/${file}`, `${to}/${file}`);
    }
  } else {
    const output = isToDirectory ? `${to}/${basename(from)}` : to;
    copyFileSync(from, output);
  }
};

const removeOutput = (to: string) => {
  try {
    rmSync(to);
  } catch (error) {
    console.error(error);
  }
};

export function copy(options: CopyPluginOptions): Plugin {
  const { from, to, on = 'onEnd', watch = true } = options;

  return {
    name: '@amoklab/esbuild-copy-plugin',
    setup(build) {
      const run = () => copyFiles(from, to);
      build[on](() => {
        run();
        if (watch) {
          chokidar
            .watch(from, { ignoreInitial: false, awaitWriteFinish: { stabilityThreshold: 250 } })
            .on('change', run)
            .on('add', run)
            .on('unlink', (file) => {
              const rel = relative(from, file);
              removeOutput(join(to, rel));
            });
        }
      });
    },
  };
}
