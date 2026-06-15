import { describe, expect, it, vi } from 'vitest';

import { build, PluginBuild } from 'esbuild';
import { existsSync, rmSync } from 'fs';
import { build as tsupBuild } from 'tsup';
import { copy } from './esbuild-copy-files';

const fromDir = 'sample';
const fromFile = `${fromDir}/sample.json`;
const toDir = 'sample-output';
const toFile = `${toDir}/sample.json`;
const toFile2 = `${toDir}/sample-2.txt`;

describe('Copy file plugin', () => {
  it('use onEnd by default', async () => {
    const mockBuild = { onStart: vi.fn(), onEnd: vi.fn() } as unknown as PluginBuild;

    copy({ from: fromFile, to: toFile }).setup(mockBuild);

    expect(mockBuild.onStart).toHaveBeenCalledTimes(0);
    expect(mockBuild.onEnd).toHaveBeenCalledTimes(1);
  });

  it('use onStart', async () => {
    const mockBuild = { onStart: vi.fn(), onEnd: vi.fn() } as unknown as PluginBuild;

    copy({ from: fromFile, to: toFile, on: 'onStart' }).setup(mockBuild);

    expect(mockBuild.onStart).toHaveBeenCalledTimes(1);
    expect(mockBuild.onEnd).toHaveBeenCalledTimes(0);
  });

  it('copy file with esbuild', async () => {
    await build({ plugins: [copy({ from: fromFile, to: toFile })] });

    expect(existsSync(toFile)).toBe(true);
    rmSync(toFile);
    expect(existsSync(toFile)).toBe(false);
  });

  /* this is slow and might not even need to test */
  it('copy file with tsup build', async () => {
    await tsupBuild({ silent: true, esbuildPlugins: [copy({ from: fromFile, to: toFile })] });

    expect(existsSync(toFile)).toBe(true);
    rmSync(toFile);
    expect(existsSync(toFile)).toBe(false);
  });

  it('copy directory', async () => {
    await build({ plugins: [copy({ from: fromDir, to: toDir })] });

    expect(existsSync(toFile)).toBe(true);
    expect(existsSync(toFile2)).toBe(true);
    rmSync(toFile);
    rmSync(toFile2);
    expect(existsSync(toFile)).toBe(false);
    expect(existsSync(toFile2)).toBe(false);
  });

  it('throw error when file does not exist', async () => {
    await expect(build({ plugins: [copy({ from: 'does-not-exist', to: toFile })] })).rejects.toThrow(
      'does-not-exist does not exist',
    );
  });

  it('throw error user try to copy directory to file', async () => {
    await expect(build({ plugins: [copy({ from: fromDir, to: toFile })] })).rejects.toThrow(
      `${toFile} is not a directory while ${fromDir} is a directory`,
    );
  });
});
