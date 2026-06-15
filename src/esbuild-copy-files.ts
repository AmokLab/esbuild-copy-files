import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { basename, dirname } from 'path';

import type { Plugin, PluginBuild } from 'esbuild';

export interface CopyPluginOptions {
  from: string;
  to: string;
  on?: 'onStart' | 'onEnd';
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

const setup = (build: PluginBuild, options: CopyPluginOptions) => {
  const { from, to, on = 'onEnd' } = options;
  const run = () => copyFiles(from, to);
  build[on](run);
};

export function copy(options: CopyPluginOptions | CopyPluginOptions[]): Plugin {
  return {
    name: '@amoklab/esbuild-copy-plugin',
    setup(build) {
      const list = Array.isArray(options) ? options : [options];
      for (const option of list) {
        setup(build, option);
      }
    },
  };
}
