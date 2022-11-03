import { isCI } from '../utils/env';
import { findPnpmWorkspaceRoot, PNPM_LOCK_FILE } from '../utils/nodeWorkspaces';
import { BasePackageManager } from './BasePackageManager';

export class PnpmPackageManager extends BasePackageManager {
  readonly name = 'pnpm';
  readonly bin = 'pnpm';
  readonly lockFile = PNPM_LOCK_FILE;

  protected getDefaultEnvironment(): Record<string, string> {
    return {
      ...super.getDefaultEnvironment(),
      // Force pnpm to install `devDependencies`, even in production environments
      NODE_ENV: 'development',
    };
  }

  workspaceRoot() {
    const root = findPnpmWorkspaceRoot(this.ensureCwdDefined('workspaceRoot'));
    if (root) {
      return new PnpmPackageManager({
        ...this.options,
        silent: this.silent,
        log: this.log,
        cwd: root,
      });
    }

    return null;
  }

  installAsync(namesOrFlags: string[] = []) {
    if (isCI() && !namesOrFlags.join(' ').includes('frozen-lockfile')) {
      namesOrFlags.unshift('--no-frozen-lockfile');
    }

    return this.runAsync(['install', ...namesOrFlags]);
  }

  addAsync(namesOrFlags: string[] = []) {
    if (!namesOrFlags.length) {
      return this.installAsync();
    }

    return this.runAsync(['add', ...namesOrFlags]);
  }

  addDevAsync(namesOrFlags: string[] = []) {
    if (!namesOrFlags.length) {
      return this.installAsync();
    }

    return this.runAsync(['add', '--save-dev', ...namesOrFlags]);
  }

  addGlobalAsync(namesOrFlags: string[] = []) {
    if (!namesOrFlags.length) {
      return this.installAsync();
    }

    return this.runAsync(['add', '--global', ...namesOrFlags]);
  }

  removeAsync(namesOrFlags: string[]) {
    return this.runAsync(['remove', ...namesOrFlags]);
  }

  removeDevAsync(namesOrFlags: string[]) {
    return this.runAsync(['remove', '--save-dev', ...namesOrFlags]);
  }

  removeGlobalAsync(namesOrFlags: string[]) {
    return this.runAsync(['remove', '--global', ...namesOrFlags]);
  }
}
