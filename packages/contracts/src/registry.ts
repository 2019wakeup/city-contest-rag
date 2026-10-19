/**
 * SceneInput 字段注册表（schema 驱动 UI 的单一真相源）。
 * key 为字段点路径；改 contracts = 改此处 = 前端表单自动跟随，表单不写死任何字段。
 */

export type ControlType = 'select' | 'number' | 'text' | 'checkbox' | 'textarea';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDef {
  label: string;
  control: ControlType;
  unit?: string;
  options?: FieldOption[];
  placeholder?: string;
}

export const FIELD_REGISTRY: Record<string, FieldDef> = {
  'climate.zone': {
    label: '气候分区',
    control: 'select',
    // 含 5 案例实际取值（B5：1-4 华南湿热区 / 2-2 东北寒冷区 / 1-3 江淮湿润区 / 2-1 华北温区…）
    options: [
      { label: '1-4 华南湿热区', value: '1-4 华南湿热区' },
      { label: '2-2 东北寒冷区', value: '2-2 东北寒冷区' },
      { label: '1-3 江淮湿润区', value: '1-3 江淮湿润区' },
      { label: '2-1 华北温区', value: '2-1 华北温区' },
      { label: '华南高温区', value: '华南高温区' },
      { label: '寒冷地区', value: '寒冷地区' },
      { label: '多雨冻融区', value: '多雨冻融区' },
      { label: '温和地区', value: '温和地区' },
      { label: '高原高寒区', value: '高原高寒区' },
    ],
    placeholder: '选择项目所在气候分区',
  },
  'climate.pgHigh': {
    label: 'PG高温等级',
    control: 'number',
    unit: '℃',
    placeholder: '如 76',
  },
  'climate.pgLow': {
    label: 'PG低温等级',
    control: 'number',
    unit: '℃',
    placeholder: '如 -22',
  },
  'traffic.level': {
    label: '交通荷载等级',
    control: 'select',
    // value 与 cases.json 场景取值对齐（heavy/medium/light/channelized），中文 label 供展示（R3-C5）
    options: [
      { label: '轻交通', value: 'light' },
      { label: '中等交通', value: 'medium' },
      { label: '重交通', value: 'heavy' },
      { label: '渠化重载', value: 'channelized' },
    ],
    placeholder: '选择交通荷载等级',
  },
  'traffic.esal': {
    label: '累计当量轴次',
    control: 'number',
    unit: 'ESAL',
    placeholder: '如 20000000',
  },
  'pavement.layer': {
    label: '路面结构层位',
    control: 'select',
    // value 与 cases.json 场景取值对齐（surface/middle/binder/deck），中文 label 供展示（R25）
    options: [
      { label: '上面层', value: 'surface' },
      { label: '中面层', value: 'middle' },
      { label: '下面层', value: 'binder' },
      { label: '桥面铺装', value: 'deck' },
    ],
    placeholder: '选择结构层位',
  },
  'pavement.structure': {
    label: '路面结构类型',
    control: 'text',
    placeholder: '如 半刚性基层沥青路面',
  },
  distresses: {
    label: '病害类型',
    control: 'checkbox',
    // B5：value 用英文 slug，与 cases.json 场景取值 / scene-tags 词典对齐；中文 label 供展示
    options: [
      { label: '车辙', value: 'rutting' },
      { label: '推移拥包', value: 'shoving' },
      { label: '横向裂缝', value: 'transverse-crack' },
      { label: '纵向裂缝', value: 'longitudinal-crack' },
      { label: '疲劳裂缝', value: 'fatigue-crack' },
      { label: '水损害', value: 'water-damage' },
      { label: '松散剥落', value: 'raveling' },
      { label: '坑槽', value: 'pothole' },
      { label: '抗滑不足', value: 'skid' },
      { label: '交通噪声', value: 'noise' },
    ],
    placeholder: '勾选主要病害（默认严重程度：中）',
  },
  'constraints.budget': {
    label: '预算',
    control: 'number',
    unit: '万元',
    placeholder: '如 500',
  },
  'constraints.schedule': {
    label: '工期',
    control: 'number',
    unit: '天',
    placeholder: '如 30',
  },
  'constraints.env': {
    label: '环保要求',
    control: 'select',
    // B5：值域与 cases.json / mock-a 判断对齐（normal/strict）
    options: [
      { label: '标准', value: 'normal' },
      { label: '严格（低碳再生等）', value: 'strict' },
    ],
    placeholder: '选择环保要求',
  },
  'constraints.noise': {
    label: '降噪要求',
    control: 'select',
    // B5：值域 none/low/high（mock-a 兼容判断）
    options: [
      { label: '无要求', value: 'none' },
      { label: '低噪要求', value: 'low' },
      { label: '高降噪要求', value: 'high' },
    ],
    placeholder: '选择降噪要求',
  },
  notes: {
    label: '备注',
    control: 'textarea',
    placeholder: '补充说明（可选）',
  },
};
