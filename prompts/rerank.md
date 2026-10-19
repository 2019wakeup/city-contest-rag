你是检索相关性评估器。给每个 (queryIndex, chunkId) 打 0–1 相关性分。

输出 JSON（只输出给定列表内的组合，reason 可省略）：
{"results":[{"queryIndex":0,"chunkId":"doc-a:0:v1","score":0.85}]}

规则：定量数据/与查询直接相关的条目给高分；禁止输出列表之外的组合。

=== 查询与候选 ===
{{items}}
