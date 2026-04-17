// Command verifiers. Engine-pure: no console output.

import { spawn, execFileSync } from 'node:child_process';

const IS_WINDOWS = process.platform === 'win32';

function isFakeShell() {
  return process.env.TT_FAKE_SHELL === '1';
}

// Fake shell used in tests: echoes the command back as stdout, exit 0.
function runFakeShell(command) {
  return Promise.resolve({
    stdout: `[fake-shell] ${command}\n`,
    stderr: '',
    exitCode: 0,
    command
  });
}

function runRealShell(command) {
  return new Promise((resolve) => {
    const shell = IS_WINDOWS ? 'cmd' : '/bin/sh';
    const args = IS_WINDOWS ? ['/c', command] : ['-c', command];
    const child = spawn(shell, args, { env: process.env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('error', (err) => {
      resolve({ stdout, stderr: stderr + String(err), exitCode: 127, command });
    });
    child.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 0, command });
    });
  });
}

export function runCommand(command) {
  if (isFakeShell()) return runFakeShell(command);
  return runRealShell(command);
}

function evaluateShellPredicates(verify, result) {
  const reasons = [];
  if (verify.exitCode !== undefined && result.exitCode !== verify.exitCode) {
    reasons.push(`expected exit code ${verify.exitCode}, got ${result.exitCode}`);
  }
  if (verify.stdoutContains && !result.stdout.includes(verify.stdoutContains)) {
    reasons.push(`stdout should contain "${verify.stdoutContains}"`);
  }
  if (verify.stderrContains && !result.stderr.includes(verify.stderrContains)) {
    reasons.push(`stderr should contain "${verify.stderrContains}"`);
  }
  if (verify.stdoutMatches) {
    const re = new RegExp(verify.stdoutMatches);
    if (!re.test(result.stdout)) {
      reasons.push(`stdout should match /${verify.stdoutMatches}/`);
    }
  }
  if (typeof verify.custom === 'function') {
    try {
      const out = verify.custom(result);
      if (!out || !out.ok) {
        reasons.push(out?.reason || 'custom predicate failed');
      }
    } catch (err) {
      reasons.push(`custom predicate threw: ${err.message}`);
    }
  }
  return reasons;
}

export async function verifyShell(verify, command) {
  const result = await runCommand(command);
  const reasons = evaluateShellPredicates(verify, result);
  return {
    ok: reasons.length === 0,
    reason: reasons.join('; ') || undefined,
    detail: result
  };
}

export function verifyWhich(verify) {
  if (isFakeShell()) {
    // Treat `tt` and common tools as present in fake mode.
    return { ok: true };
  }
  try {
    const cmd = IS_WINDOWS ? 'where' : 'which';
    execFileSync(cmd, [verify.binary], { stdio: 'ignore' });
    return { ok: true };
  } catch {
    return { ok: false, reason: `could not find "${verify.binary}" on PATH` };
  }
}

export function verifyPrompt(verify, userAnswer) {
  const ok = userAnswer === verify.answer;
  return { ok, reason: ok ? undefined : 'not quite — think again' };
}
