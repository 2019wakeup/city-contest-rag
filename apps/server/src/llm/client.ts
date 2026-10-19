import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import type { ZodType } from 'zod';
import type { ChatMessage, RecommendationReport } from '@road-rec/contracts';

export type LlmStatus = 'ok' | 'degraded';

/** 测试注入接口：fake LLM 返回原始文本（无真实网络）。 */
export type LlmCall = (prompt: string, temperature?: number) => Promise<string>;

export interface GenerateOptions<T> {
  prompt: string;
  schema: ZodType<T>;
  temperature?: number;
  /** 注入 fake LLM；缺省走 openai SDK（env 配置 DEEPSEEK_API_KEY/BASE_URL） */
  llm?: LlmCall;
}

const PROMPTS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../prompts');

export function readPrompt(name: string): string {
  return readFileSync(join(PROMPTS_DIR, name), 'utf8');
}

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.DEEPSEEK_API_KEY || process.env.LLM_OFF === '1') return null;
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    });
  }
  return client;
}

/**
 * 结构化生成：openai SDK → JSON mode → zod 校验；校验/解析失败重试 ≤2，仍败 → degraded。
 * LLM 未配置或 LLM_OFF=1 → 立即 degraded（不触网）。
 */
export async function generateStructured<T>(
  opts: GenerateOptions<T>,
): Promise<{ data: T | null; status: LlmStatus }> {
  const temperature = opts.temperature ?? 0.3;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let raw: string;
      if (opts.llm) {
        raw = await opts.llm(opts.prompt, temperature);
      } else {
        const c = getClient();
        if (!c) return { data: null, status: 'degraded' };
        const completion = await c.chat.completions.create({
          model: 'deepseek-chat',
          temperature,
          messages: [{ role: 'user', content: opts.prompt }],
          response_format: { type: 'json_object' },
        });
        raw = completion.choices[0]?.message?.content ?? '';
      }
      const parsed = opts.schema.safeParse(JSON.parse(raw));
      if (parsed.success) return { data: parsed.data, status: 'ok' };
    } catch {
      // 解析/校验失败 → 重试
    }
  }
  return { data: null, status: 'degraded' };
}

/** 带超时的 Promise（B3 重排用：超时回退原序） */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`LLM 调用超时（${ms}ms）`)), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/**
 * 单次 LLM 文本调用（B3 重排用）：注入 fake 或 openai SDK；未配置/失败/超时 → null（调用方回退）。
 */
export async function callLlmText(
  prompt: string,
  opts: { temperature?: number; llm?: LlmCall; timeoutMs?: number },
): Promise<string | null> {
  const timeoutMs = opts.timeoutMs ?? 30000;
  try {
    if (opts.llm) {
      return await withTimeout(opts.llm(prompt, opts.temperature ?? 0), timeoutMs);
    }
    const c = getClient();
    if (!c) return null;
    const completion = await withTimeout(
      c.chat.completions.create({
        model: 'deepseek-chat',
        temperature: opts.temperature ?? 0,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
      timeoutMs,
    );
    return completion.choices[0]?.message?.content ?? '';
  } catch {
    return null;
  }
}

export interface ChatOpts {
  question: string;
  history?: ChatMessage[];
  reportContext?: RecommendationReport;
}

/** 对话流式响应器（注入接口；真实实现走 openai streaming） */
export type ChatResponder = (opts: ChatOpts, onDelta: (delta: string) => void) => Promise<void>;

function buildChatPrompt(opts: ChatOpts): string {
  const template = readPrompt('chat.md');
  return template
    .replace('{{reportContext}}', JSON.stringify(opts.reportContext ?? {}, null, 2))
    .replace('{{question}}', opts.question);
}

export const streamChat: ChatResponder = async (opts, onDelta) => {
  const c = getClient();
  if (!c) return;
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...(opts.history ?? []).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: buildChatPrompt(opts) },
  ];
  const stream = await c.chat.completions.create({
    model: 'deepseek-chat',
    temperature: 0.3,
    messages,
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) onDelta(delta);
  }
};
