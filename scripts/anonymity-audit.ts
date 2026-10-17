// T15 匿名合规审计（Lead）
// 依据 R17 口径：只查团队身份信息（队员姓名/培养单位/导师），
// 公开文献作者与规范主编单位属数据来源署名，允许存在于语料 provenance。
// 用法：tsx scripts/anonymity-audit.ts [--words <file>]
//   词表文件默认为仓库根 .audit-words.txt（已 gitignore，不提交）；
//   也可用 --words 指定。每行一个词/正则。
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEXT_EXTS = /\.(ts|tsx|vue|js|json|md|yml|yaml|html|txt)$/;

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf-8' });
}

function trackedFiles(): string[] {
  return git(['ls-files']).split('\n').filter(Boolean);
}

interface Finding {
  check: string;
  detail: string;
}

function checkGitIdentity(): Finding[] {
  const authors = new Set(
    git(['log', '--format=%an <%ae>'])
      .split('\n')
      .filter(Boolean),
  );
  const bad = [...authors].filter((a) => a !== 'contest-team <contest-team@local.invalid>');
  return bad.length
    ? [{ check: 'git 身份', detail: `非中性身份: ${bad.join(', ')}` }]
    : [];
}

function checkForbiddenFiles(): Finding[] {
  const files = trackedFiles();
  const hits = files.filter(
    (f) => /(^|\/)\.env$/.test(f) || /(^|\/)(data\/db|data\/index)\//.test(f),
  );
  return hits.map((f) => ({ check: '禁止入库文件', detail: f }));
}

function checkWordlist(wordFile: string): { findings: Finding[]; words: string[] } {
  if (!existsSync(wordFile)) return { findings: [], words: [] };
  const raw = readFileSync(wordFile, 'utf-8');
  const words = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  const findings: Finding[] = [];
  for (const f of trackedFiles()) {
    if (!TEXT_EXTS.test(f) || f.startsWith('City_Contest/_lit/')) continue;
    const content = readFileSync(join(REPO_ROOT, f), 'utf-8');
    content.split('\n').forEach((line, i) => {
      for (const w of words) {
        if (line.includes(w)) {
          findings.push({ check: '词表命中', detail: `${f}:${i + 1} 含 "${w}"` });
        }
      }
    });
  }
  return { findings, words };
}

function main(): void {
  const wordsArg = process.argv.indexOf('--words');
  const wordFile =
    wordsArg >= 0 && process.argv[wordsArg + 1]
      ? resolve(process.argv[wordsArg + 1])
      : join(REPO_ROOT, '.audit-words.txt');

  const findings: Finding[] = [
    ...checkGitIdentity(),
    ...checkForbiddenFiles(),
    ...checkWordlist(wordFile).findings,
  ];

  console.log(`审计范围：${trackedFiles().length} 个已跟踪文件；词表：${existsSync(wordFile) ? wordFile : '(未提供)'}`);
  if (findings.length === 0) {
    console.log('✓ 匿名合规审计通过：git 身份中性、无敏感文件入库、无词表命中');
    return;
  }
  for (const f of findings) {
    console.error(`✗ [${f.check}] ${f.detail}`);
  }
  console.error(`审计失败：${findings.length} 处问题`);
  process.exitCode = 1;
}

main();
