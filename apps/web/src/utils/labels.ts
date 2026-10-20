/**
 * 统一对外中文标签（P6）：界面不出现英文 docType / 内部键名。
 * 各组件从单一真相源取 label，避免重复定义。
 */

export const DOC_TYPE_LABELS: Record<string, string> = {
  knowledge: '知识条目',
  standard: '规范',
  literature: '文献',
  enterprise: '企业资料',
  table: '定量表格',
  'literature-full': '文献章节',
}

export const TRAFFIC_LEVEL_LABELS: Record<string, string> = {
  light: '轻交通',
  medium: '中等交通',
  heavy: '重交通',
  channelized: '渠化重载',
}

export const DISTRESS_LABELS: Record<string, string> = {
  rutting: '车辙',
  shoving: '推移拥包',
  'transverse-crack': '横向裂缝',
  'longitudinal-crack': '纵向裂缝',
  'fatigue-crack': '疲劳裂缝',
  'water-damage': '水损害',
  raveling: '松散剥落',
  pothole: '坑槽',
  skid: '抗滑不足',
  noise: '交通噪声',
}

export const PERF_LABELS: Record<string, string> = {
  highTemp: '高温性能',
  lowTemp: '低温性能',
  fatigue: '疲劳性能',
  waterStability: '水稳定性',
  lcc: '全生命周期成本',
  carbon: '碳排放',
  expectedLife: '预期寿命',
  constructability: '施工可行性',
}

/** 六步 pipeline 中文名（StepStepper 与紧凑步进条共用）。 */
export const STEP_LABELS: Record<string, string> = {
  parse: '解析',
  mapping: '映射',
  recall: '召回',
  predict: '预测',
  rank: '排序',
  report: '报告',
}

/** F4：企业实测指标 11 项中文名（Candidate.labIndicators）。 */
export const LAB_INDICATOR_LABELS: Record<string, string> = {
  vv: '空隙率 VV',
  vma: 'VMA',
  vfa: 'VFA',
  asphaltContent: '沥青含量',
  ms: '稳定度 MS',
  fl: '流值 FL',
  bendingModulus: '劲度模量',
  tsr: 'TSR',
  retainedStability: '残留稳定度',
  ds: '动稳定度 DS',
  bendingStrain: '弯拉应变',
}

export const LAB_INDICATOR_UNITS: Record<string, string> = {
  vv: '%',
  vma: '%',
  vfa: '%',
  asphaltContent: '%',
  ms: 'kN',
  fl: 'mm',
  bendingModulus: 'MPa',
  tsr: '%',
  retainedStability: '%',
  ds: '次/mm',
  bendingStrain: 'με',
}

/** 未知键回退原文（前向兼容）。 */
export function labelOf(map: Record<string, string>, key: string): string {
  return map[key] ?? key
}
