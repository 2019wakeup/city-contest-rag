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
    options: [
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
    options: [
      { label: '车辙', value: '车辙' },
      { label: '横向裂缝', value: '横向裂缝' },
      { label: '纵向裂缝', value: '纵向裂缝' },
      { label: '水损害', value: '水损害' },
      { label: '冻融剥落', value: '冻融剥落' },
      { label: '坑槽', value: '坑槽' },
      { label: '松散', value: '松散' },
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
    control: 'text',
    placeholder: '如 环保要求高',
  },
  'constraints.noise': {
    label: '降噪要求',
    control: 'text',
    placeholder: '如 城市道路需低噪',
  },
  notes: {
    label: '备注',
    control: 'textarea',
    placeholder: '补充说明（可选）',
  },
};
