// T14 e2e-degradation：三档降级路径验收（Lead）
// 自起一个降级配置的 server 子进程（LLM_OFF=1 + A/C 端点指向不可达端口），断言后杀掉。
import { spawn, type ChildProcess } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3100;
const BASE = `http://127.0.0.1:${PORT}`;

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`断言失败: ${msg}`);
}

async function waitHealthy(timeoutMs = 30000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/v1/health`);
      if (res.ok) return;
    } catch {
      // 未就绪
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('降级 server 未在 30s 内就绪');
}

async function recommendOnce(): Promise<any> {
  const scene = {
    schemaVersion: '1',
    climate: { zone: '1-4 华南湿热区', pgHigh: 76, pgLow: -10 },
    traffic: { level: 'heavy', esal: 30000000 },
    pavement: { layer: 'surface', structure: '半刚性基层沥青路面' },
    distresses: [{ type: 'rutting', severity: 'severe' }],
    constraints: { budget: 500, schedule: 30, env: 'normal', noise: 'none' },
    notes: '高温重载路段车辙处治',
  };
  const res = await fetch(`${BASE}/api/v1/recommend`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(scene),
  });
  const raw = await res.text();
  let report: any;
  try {
    report = JSON.parse(raw);
  } catch {
    throw new Error(`非 JSON 响应 (${res.status}): ${raw.slice(0, 200)}`);
  }
  return { status: res.status, report };
}

async function main(): Promise<void> {
  const child: ChildProcess = spawn(
    'pnpm',
    ['exec', 'tsx', 'apps/server/src/index.ts'],
    {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        PORT: String(PORT),
        LLM_OFF: '1',
        MODULE_A_ENDPOINT: 'http://127.0.0.1:9',
        MODULE_C_ENDPOINT: 'http://127.0.0.1:9',
        RETRIEVAL_BACKEND: 'sqlite', // 降级测试用 sqlite，避免 lancedb 二进制依赖
        EMBEDDING_MODEL: 'multilingual-e5-small',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let stdout = '';
  child.stdout?.on('data', (d) => (stdout += String(d)));
  child.stderr?.on('data', (d) => (stdout += String(d)));

  try {
    await waitHealthy();
    const { status, report } = await recommendOnce();
    assert(status === 200, `HTTP ${status}`);
    assert(report.llmStatus === 'degraded', `llmStatus=${report.llmStatus}（应 degraded）`);
    assert(report.adapterMode.a === 'mock' && report.adapterMode.c === 'mock', `adapterMode=${JSON.stringify(report.adapterMode)}（应 mock）`);
    assert(Array.isArray(report.sections) && report.sections.length > 0, 'sections 为空（模板降级文案缺失）');
    assert(report.candidates.length === 5, `candidates=${report.candidates.length}（应 5）`);
    assert(
      report.candidates.every((c: any) => c.radar && typeof c.radar.highTemp === 'number'),
      '雷达图数据缺失',
    );
    console.log('✓ 降级路径通过（LLM 挂→模板文案；A/C 不可达→mock；主流程不崩）');
    console.log(`  证据数=${report.evidence.length}, warnings=${JSON.stringify(report.warnings)}`);
  } catch (err) {
    console.error('✗ 降级路径失败:', err instanceof Error ? err.message : String(err));
    console.error('--- server 输出尾部 ---');
    console.error(stdout.slice(-1500));
    process.exitCode = 1;
  } finally {
    child.kill('SIGTERM');
    setTimeout(() => child.kill('SIGKILL'), 3000).unref();
  }
}

void main();
