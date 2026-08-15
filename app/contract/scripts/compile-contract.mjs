import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptDir, '..');
const compactVersion = process.env.COMPACTC_VERSION ?? '0.30.0';
const env = {
  ...process.env,
  COMPACTC_VERSION: compactVersion,
};

function toWslPath(winPath) {
  const driveLetter = winPath.slice(0, 1).toLowerCase();
  const rest = winPath.slice(2).replace(/\\/g, '/');
  return `/mnt/${driveLetter}${rest}`;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: packageDir,
    env,
    shell: true,
    stdio: 'inherit',
  });
