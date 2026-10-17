// 预下载 bge-m3 到 data/index/hf-cache（演示前准备，T14 Lead 脚本）
import { createEmbedder } from '@road-rec/embedding';

async function main(): Promise<void> {
  const e = await createEmbedder({
    model: 'bge-m3',
    cacheDir: '/bigdisk/lhg/road_rec/data/index/hf-cache',
  });
  const v = await e.embed(['数智选材 沥青路面养护场景']);
  console.log(`BGE-M3 READY dim=${e.dim} vec_len=${v[0].length} model=${e.modelName}`);
}

void main();
