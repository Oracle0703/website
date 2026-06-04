# Website P3B Case Study Depth Acceptance Report

## 1. 实现范围

| 模块 | 完成内容 |
|---|---|
| Project model | 新增 `ProjectCaseStudy`，并让 `Project`、`LocalizedProjectContent`、`ProjectView` 全部携带 `caseStudy` |
| 项目内容 | 5 个项目均补齐 problem、constraints、decisions、implementation、result、next |
| 英文内容 | 英文 `ProjectView.caseStudy` 纳入 D4 英文内容护栏，目标仍是 0 CJK |
| 详情页 | Project detail 新增 Case study 区块，放在证据资产之后、架构实现之前 |
| 脱敏边界 | Knock 和 Dashboard 只公开能力、架构与脱敏证明策略，不展示原始日志、IP、内部路径、OSS 对象或私密配置 |
| 发布流程 | `RELEASE_CHECKLIST.md` 增加 P3B Case Study 条件必跑 |

## 2. 非目标

| 非目标 | 原因 |
|---|---|
| 不伪造业务指标 | 当前没有真实转化、收入或用户增长数据，不能写成结果证明 |
| 不公开内部运行数据 | Dashboard 和 Knock 可能包含日志、任务、对象存储和部署状态 |
| 不新增 CMS | P3B 只深化公开项目案例，不改变内容生产链路 |
| 不把详情页改成长文博客 | 案例页保持决策证据密度，深度展开仍放 Blog |
| 不新增截图资产基线 | 本阶段先补结构和文案，真实截图资产需要单独人工检查 |

## 3. 验证

| 命令 | 通过标准 |
|---|---|
| `npm test` | ProjectCaseStudy、详情页静态契约、P3B 文档护栏全部通过 |
| `npm run audit:website-english-content` | 英文 route surface 与 ProjectView 仍无 CJK 主体泄漏 |
| `npm run validate:website-content` | 现有内容 frontmatter、图片和 series 校验通过 |
| `npm run build:website` | Next.js production build 通过 |
| `git diff --check` | 无 whitespace error |

## 4. 剩余风险

| 风险 | 当前处理 | 后续建议 |
|---|---|---|
| 案例仍缺真实截图 | 使用 mock 或 none asset，并解释下一步资产计划 | 单独做项目资产截图与脱敏验收 |
| 结果证明仍偏阶段性 | 只写公开路由、规格、测试和工程边界 | 有真实使用数据后再补量化结果 |
| `projects.ts` 中英内容同文件导致审计阈值上升 | 英文 `ProjectView` 仍保持 0 CJK，localized-source 登记新基线 | 后续如内容继续膨胀，可拆分 zh/en 数据文件 |
| Dashboard/Knock 脱敏资产未生成 | 当前明确不公开原始截图 | P3-C 或资产专项中生成架构图或聚合摘要 |

## 5. 下一阶段

| 阶段 | 建议 |
|---|---|
| P3-C Content Operations | 优先把内容健康度接入 Dashboard：published/draft、metadata、series coverage、latest posts 和问题摘要 |
| 资产专项 | 在 P3-C 前后补 AI Page Analysis、Tracker、Timestamp Tool 的真实截图，并为 Dashboard/Knock 生成脱敏架构图 |

