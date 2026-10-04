import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 1 || args[0] !== '--check')) {
    throw new Error('Usage: npm run deploy:production [-- --check]');
  }
  const branch = git('branch', '--show-current');
  if (!branch.startsWith('release/')) {
    throw new Error('Production requires a release/* branch. Keep main for development.');
  }
  if (git('status', '--porcelain', '--untracked-files=all')) {
    throw new Error('Commit all changes before deploying the release.');
  }
  const commit = git('rev-parse', 'HEAD');
  const published = git('ls-remote', '--exit-code', 'origin', `refs/heads/${branch}`).split(/\s+/)[0];
  if (published !== commit) {
    throw new Error('Publish this exact release commit to origin before deploying.');
  }
  console.log(`Production release: ${branch}\nCommit: ${commit}`);
  if (args[0] !== '--check') {
    // Use an installed Vercel CLI, or an explicitly supplied JS entry point.
    const cli = process.env.ILFC_VERCEL_CLI;
    const result = spawnSync(cli ? process.execPath : 'vercel', [
      ...(cli ? [cli] : []),
      'deploy', '--prod', '--yes', '--project', 'ilovefreecompressor',
      '--scope', 'kathir-project',
      '--meta', `releaseBranch=${branch}`, '--meta', `releaseCommit=${commit}`,
    ], { cwd: root, stdio: 'inherit', env: process.env });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
} catch (error) {
  console.error(`Production deployment stopped: ${error.message}`);
  process.exitCode = 1;
}
