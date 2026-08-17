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

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.platform === 'win32') {
  const wslPackageDir = toWslPath(packageDir);
  const bashCommand = [
    `cd '${wslPackageDir}'`,
    `compact compile src/donor-proof.compact src/managed/donor-proof`,
  ].join(' && ');

  const result = spawnSync('wsl', ['bash', '-lc', bashCommand], {
    cwd: packageDir,
    env,
    shell: false,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
} else {
  run('npm', ['exec', 'fetch-compactc', '--', `--version=${compactVersion}`]);
  run('npm', ['exec', 'run-compactc', '--', 'src/donor-proof.compact', './src/managed/donor-proof']);
}
