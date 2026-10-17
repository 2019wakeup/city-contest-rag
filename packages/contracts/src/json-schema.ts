import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodType } from 'zod';

/**
 * zod schema → JSON Schema（OpenAPI 文档与前端可选校验共用）。
 * 统一注入 $schema 骨架。
 */
export function toJsonSchema(schema: ZodType): object {
  const json = zodToJsonSchema(schema);
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...(json as object),
  };
}
