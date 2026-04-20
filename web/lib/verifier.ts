import type { VerifySpec, ShellResult } from './types';
import { runCommand } from './shell-sim';

export type VerifyResult = { ok: boolean; reason?: string };

export function verifyStep(spec: VerifySpec, input: string): VerifyResult {
  if (spec.mode === 'which') {
    // In browser mode, which always passes — user is learning the command to type
    return { ok: true };
  }

  if (spec.mode === 'prompt') {
    const ok = input === spec.answer;
    return { ok, reason: ok ? undefined : 'not quite — think again' };
  }

  // shell mode: simulate the command, then evaluate predicates
  const result = runCommand(input);
  return evaluatePredicates(spec, result, input);
}

export function evaluatePredicates(spec: VerifySpec, result: ShellResult, input = ''): VerifyResult {
  const reasons: string[] = [];

  if (spec.exitCode !== undefined && result.exitCode !== spec.exitCode) {
    reasons.push(`expected exit code ${spec.exitCode}, got ${result.exitCode}`);
  }
  if (spec.stdoutContains && !result.stdout.includes(spec.stdoutContains)) {
    reasons.push(`expected output to contain "${spec.stdoutContains}"`);
  }
  if (spec.stdoutMatches) {
    const re = new RegExp(spec.stdoutMatches);
    if (!re.test(result.stdout)) {
      reasons.push(`expected output to match /${spec.stdoutMatches}/`);
    }
  }
  if (spec.stderrContains && !result.stderr.includes(spec.stderrContains)) {
    reasons.push(`expected stderr to contain "${spec.stderrContains}"`);
  }
  if (typeof spec.custom === 'function') {
    try {
      const out = spec.custom(result, input);
      if (!out || !out.ok) {
        reasons.push(out?.reason || 'custom check failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      reasons.push(`custom check threw: ${msg}`);
    }
  }

  return {
    ok: reasons.length === 0,
    reason: reasons.join('; ') || undefined,
  };
}
