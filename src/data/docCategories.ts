export const docCategories = [
  { key: 'introduction', label: '入门', blurb: '它是什么、怎么安装、怎么跑起来、需要什么环境。' },
  { key: 'core-concepts', label: '核心概念', blurb: '浏览器与页面的管理、交互、页内脚本执行与网络日志。' },
  { key: 'guides', label: '指南', blurb: '配置、调试、截图、PDF、扩展、Cookie 等逐项专题。' },
  { key: 'examples', label: '示例', blurb: '官方示例与用例索引。' },
  { key: 'integrations', label: '集成', blurb: '与 Angular、Docker 等工具链的配合。' },
  { key: 'community', label: '社区', blurb: '贡献指南、故障排查与社区资源。' },
  { key: 'reference', label: '参考', blurb: 'WebDriver BiDi 支持现状与浏览器支持矩阵。' },
] as const;

export type DocCategory = (typeof docCategories)[number]['key'];

export const categoryLabel = (key: DocCategory) =>
  docCategories.find((category) => category.key === key)?.label ?? key;