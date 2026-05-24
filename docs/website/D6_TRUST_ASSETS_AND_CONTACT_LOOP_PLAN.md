# Website D6 Trust Assets and Contact Loop Plan

> **For agentic workers:** D6 starts after D5 visual and conversion acceptance. Keep D3 route structure, D4 English content guards, and D5 visual/conversion screenshots intact. D6 should add real proof assets and a contact decision path without introducing broad backend scope prematurely.

**Goal:** Turn the refined website into a more verifiable portfolio by adding a clear asset strategy, project screenshot/mock boundaries, and a contact loop decision that can be implemented safely.

**Architecture:** Keep the current git-based content model, Next.js App Router, locale-aware ProjectView, D5 UI tokens, and browser verification. Add only explicit asset metadata and contact-loop decisions first; defer any backend form, database, email delivery, or AI model integration until their security and privacy boundaries are documented.

**Tech Stack:** Next.js 14 App Router, TypeScript, React, Tailwind CSS v4, static public assets, Node.js 22, Playwright, current Node test suite.

---

## 1. D6 结论

| 项目 | 决策 |
|---|---|
| 推荐路线 | 先补“可验证资产”和“联系闭环决策”，再决定是否进入后端表单或 AI V1 |
| 优先页面 | Project detail、Projects 列表、Contact、AI 页面分析助手、首页 Featured Projects |
| 核心问题 | D5 已提升视觉和证据文案，但项目仍缺真实截图或明确 product mock；Contact 仍是站内策略，不是完整联系闭环 |
| 核心原则 | 不伪造证据、不写假联系方式、不把 mock 包装成生产能力、不在无安全设计时上线表单 |
| 完成标准 | 访问者能看到每个重点项目的证据来源边界，并知道下一步如何真实发起沟通 |

## 2. 目标与非目标

| 类型 | 内容 |
|---|---|
| 目标 | 定义项目证据资产模型：真实截图、product mock、架构图、文档链接、不可用原因 |
| 目标 | 为重点项目建立项目截图与 mock 策略，避免纯文字 evidence |
| 目标 | 对 Contact 做明确产品决策：真实公开渠道、站内策略、或 D7 后端表单 |
| 目标 | 若选择表单，先完成反垃圾、隐私边界、数据保存、告警和失败状态设计 |
| 目标 | 为 AI 页面分析 V1 后端建立前置规格，不在 D6 直接接真实模型 |
| 目标 | 扩展测试和 release checklist，保证资产、联系路径和英文内容质量不回退 |
| 非目标 | 不引入 CMS、数据库或后台编辑器 |
| 非目标 | 不改 D3 URL 结构，不新增 `/zh/*` |
| 非目标 | 不在没有真实渠道时伪造邮箱、社交链接或客户背书 |
| 非目标 | 不把 D6 扩展为完整后端联系表单实现 |
| 非目标 | 不在 D6 接入真实 AI 抓取、模型调用、登录账户或支付 |

## 3. 当前基线

| 区域 | 当前状态 | D6 风险 |
|---|---|---|
| Projects | D5 已有 `evidence`、`architecture`、`tradeoffs`、`roadmap` | 仍以文字证据为主，缺少真实截图或明确 mock |
| Project detail | 已能展示完整证据结构 | 若新增图片，需要 alt、尺寸、移动端截图和英文文案护栏 |
| Contact | 已避免假邮箱，采用站内联系策略 | 真实转化仍弱；若上表单，需要反垃圾和隐私设计 |
| AI 页面分析助手 | 已说明 Mock Pipeline limitation 和 V1 roadmap | 若继续产品化，需要 SSRF、错误码、模型 schema 和超时边界 |
| 视觉截图 | D5 已更新 4 张截图基线 | 新资产会再次触发截图变化，需要先人工检查 |
| 英文审计 | ProjectView / BlogView 仍保持 0 CJK | 新资产 caption、alt、contact copy 容易泄漏中文 |

## 4. 资产策略

| 资产类型 | 使用场景 | 必填字段 | 边界 |
|---|---|---|---|
| 真实截图 | 已上线或可打开的页面、工具、控制台 | `src`、`alt`、`caption`、`kind: "screenshot"` | 不能展示敏感数据、真实用户数据或未脱敏日志 |
| Product mock | 尚无真实截图但需要说明产品形态 | `src`、`alt`、`caption`、`kind: "mock"` | 页面必须标记 mock，不能伪装线上结果 |
| 架构图 | 需要解释系统组成、数据流、边界 | `src` 或 structured diagram data、`alt`、`caption` | 不泄漏密钥、内网地址或部署敏感信息 |
| 文档链接 | 已有规格、验收报告、公开文章 | `label`、`href`、`description` | 不链接 repository-only 私有路径到公开页面 |
| 暂无资产说明 | 当前确实没有可公开图片 | `reason`、`nextAssetStep` | 不留空 section，不用占位图糊弄 |

## 5. Contact 闭环决策

| 方案 | 做法 | 成本 | 风险 | 推荐 |
|---|---|---:|---|---|
| 公开真实渠道 | 使用真实邮箱或真实个人社交链接作为主 CTA | 低 | 需要用户确认可公开信息 | 若有真实渠道，优先 |
| 继续站内策略 | 主 CTA 指向 Projects / AI demo / Blog，并说明沟通前置条件 | 低 | 转化链路不完整 | 适合当前无公开联系方式阶段 |
| 静态 `mailto:` | 使用真实邮箱生成 `mailto:` 链接 | 低 | 垃圾邮件、隐私暴露 | 需要明确邮箱和反垃圾预期 |
| 后端表单 | 表单提交到 API，再通知邮箱或 dashboard | 高 | 反垃圾、隐私、存储、告警、失败重试 | 拆到 D7 或独立阶段 |

**D6 默认决策：** 如果用户未提供真实公开联系方式，继续保留站内策略，不新增表单；同时写清楚 D7 表单的前置条件。

## 6. AI V1 后端前置边界

| 维度 | D6 只做 | D6 不做 |
|---|---|---|
| 输入 schema | 定义 URL、Brief、长度、语言、错误文案 | 不接真实 API |
| URL 安全 | 记录 SSRF、防内网、防云 metadata、防超时策略 | 不实现抓取服务 |
| 模型输出 | 定义 scores、issues、recommendations、backlog schema | 不调用真实模型 |
| 失败状态 | 定义 invalid_url、url_unreachable、auth_required_page、analysis_timeout 等状态 | 不做队列或重试系统 |
| 验收 | 增加文档和 schema 护栏 | 不保存历史、不做登录 |

## 7. Task 拆解

### Task 1: 资产策略与数据模型

**Files:**
- Modify: `docs/website/D6_TRUST_ASSETS_AND_CONTACT_LOOP_PLAN.md`
- Modify: `tests/website-static-rendering-spike.test.js`
- Optional modify: `apps/website/lib/projects.ts`
- Optional modify: `tests/website-projects.test.js`

- [x] **Step 1: 写失败测试**
  - 检查 D6 计划存在；
  - 检查真实可验证资产、联系闭环、项目截图、反垃圾、隐私边界；
  - 检查不引入 CMS、不改 D3 URL 结构。

- [x] **Step 2: 定义资产字段**
  - `kind` 区分 screenshot、mock、diagram、doc、none；
  - 图片资产必须有 `src`、`alt`、`caption`；
  - none 状态必须有 `reason` 和 `nextAssetStep`。

- [x] **Step 3: 明确公开边界**
  - 不公开敏感数据；
  - mock 必须标记；
  - repository-only docs 不作为公开链接。

### Task 2: 项目截图与 mock 策略

**Files:**
- Modify: `apps/website/lib/projects.ts`
- Modify: `apps/website/app/projects/[slug]/project-detail-client.tsx`
- Modify: `tests/website-projects.test.js`
- Modify: `tests/website-detail-static-pages.test.js`
- Optional add: `apps/website/public/projects/**`

- [x] **Step 1: 写失败测试**
  - 每个 project 有资产策略；
  - Project detail 能渲染 screenshot/mock/none 资产状态；
  - 英文资产 alt/caption 无 CJK。

- [x] **Step 2: 选择资产状态**
  - 已有页面可截图的项目使用真实截图；
  - 无真实截图但产品形态明确的项目使用 product mock；
  - 无法公开的项目使用 none 状态并解释原因。

- [x] **Step 3: 接入详情页**
  - 图片有稳定 aspect ratio；
  - 移动端不横向溢出；
  - mock 与真实截图视觉标签明确。

### Task 3: Contact 联系闭环决策

**Files:**
- Modify: `apps/website/lib/i18n.ts`
- Modify: `apps/website/app/contact/contact-client.tsx`
- Modify: `tests/website-home-refinement.test.js`
- Modify: `tests/website-browser-static.spec.ts`
- Create: `docs/website/D7_CONTACT_FORM_SPEC.md`

- [x] **Step 1: 写失败测试**
  - Contact 仍不包含 `example.com`、`mailto:hello`；
  - 若出现 `mailto:`，必须不是占位邮箱；
  - `/en/contact` 主体无 CJK。

- [x] **Step 2: 决定联系方案**
  - 如果用户提供真实邮箱或社交链接，主 CTA 指向真实渠道；
  - 如果没有真实渠道，继续站内策略；
  - 如果要表单，先生成 D7 表单规格，不直接实现。

- [x] **Step 3: 表单前置规格**
  - 反垃圾：honeypot、频率限制、最小输入质量；
  - 隐私边界：保存哪些字段、保存多久、如何删除；
  - 失败状态：提交失败、重复提交、通知失败。

### Task 4: AI V1 后端前置规格

**Files:**
- Modify: `docs/website/AI_PAGE_ANALYSIS_V1_PRODUCT_SPEC.md`
- Modify: `tests/website-d4-english-content.test.js`
- Create: `docs/website/AI_PAGE_ANALYSIS_V1_TECH_SPEC.md`

- [x] **Step 1: 写失败测试**
  - V1 spec 包含 SSRF、防内网、防云 metadata；
  - 包含输入 schema、错误码、模型输出 schema；
  - 页面仍说明 mock，不暗示真实模型。

- [x] **Step 2: 补技术边界**
  - URL 校验和抓取超时；
  - 模型输出不可解析时的恢复策略；
  - 低置信度结果的人工复核标记。

- [x] **Step 3: 保持 D6 非实现边界**
  - 不新增 `/api/analyze`；
  - 不新增模型 key、队列、数据库；
  - 不新增登录或历史记录。

### Task 5: 验收与发布护栏

**Files:**
- Modify: `docs/website/RELEASE_CHECKLIST.md`
- Modify: `tests/website-browser-static.spec.ts`
- Modify: `docs/website/D6_TRUST_ASSETS_AND_CONTACT_LOOP_PLAN.md`
- Update: `tests/__screenshots__/website-browser-static.spec.ts/**` only after review

- [x] **Step 1: 扩展 release checklist**
  - 改项目资产必须跑 `npm test`、content validation、browser verifier；
  - 改 Contact 真实渠道必须跑英文审计和 browser verifier；
  - 更新截图前必须看实际图。

- [x] **Step 2: 增加 browser 断言**
  - Project detail 至少显示资产状态；
  - Contact 不含占位邮箱；
  - 英文主页面继续 `expectNoCjk`。

- [x] **Step 3: 完整验证**
  - `npm test`
  - `npm run audit:website-english-content`
  - `npm run validate:website-content`
  - `npm run build:website`
  - `npm run verify:website-static`
  - `npm run verify:website-browser`
  - `git diff --check`

## 8. 边界条件

| 场景 | 处理 |
|---|---|
| 用户没有提供真实联系方式 | 不写假邮箱，继续站内联系策略，并把真实联系渠道作为用户确认项 |
| 项目没有截图 | 使用 `none` 状态解释原因和下一步资产计划，或使用明确标记的 product mock |
| 图片包含敏感数据 | 不发布；先脱敏、裁剪或改用架构图 |
| 英文 alt/caption 缺失 | 测试失败，不回退中文字段 |
| 截图导致移动端首屏拥挤 | 优先降低资产展示位置，不压缩正文和按钮可点区域 |
| 表单需求出现 | 先写 D7 Contact Form Spec，覆盖反垃圾、隐私、通知、失败和部署 |
| AI V1 想直接实现 | 拆到独立后端阶段，先完成安全设计和 schema 验收 |
| 外链指向 repo 私有路径 | 不作为公开链接渲染 |

## 9. 验收命令

| 场景 | 命令 | 通过标准 |
|---|---|---|
| 文档和源码测试 | `npm test` | D6 计划、资产模型、Contact、AI V1 前置护栏通过 |
| 英文内容审计 | `npm run audit:website-english-content` | 英文 ProjectView、BlogView、route-surface 不泄漏中文主体 |
| 内容校验 | `npm run validate:website-content` | 内容 frontmatter、图片 alt 和 locale availability 合法 |
| 构建 | `npm run build:website` | Next.js production build exit 0 |
| 静态入口 | `npm run verify:website-static` | 中英文公开入口静态验收通过 |
| 浏览器验收 | `npm run verify:website-browser` | 桌面/移动截图、console、语言切换、英文内容质量通过 |
| whitespace | `git diff --check` | 无 whitespace error |

## 10. 完成定义

| 编号 | 标准 |
|---|---|
| D6.1 | D6 计划和文档护栏存在，覆盖真实资产、项目截图、联系闭环、AI V1 前置边界和验收 |
| D6.2 | 每个重点项目都有资产策略：真实截图、product mock、架构图、文档链接或 none 原因 |
| D6.3 | Project detail 能渲染资产状态，且移动端无横向滚动 |
| D6.4 | Contact 明确真实渠道或继续站内策略；若要表单，D7 spec 先行 |
| D6.5 | AI 页面分析 V1 后端边界清楚，但 D6 不新增真实模型调用 |
| D6.6 | `npm test`、`npm run audit:website-english-content`、`npm run validate:website-content`、`npm run build:website`、`npm run verify:website-static`、`npm run verify:website-browser`、`git diff --check` 全部通过 |

## 11. 推荐实施顺序

| 顺序 | 任务 | 原因 |
|---:|---|---|
| 1 | Task 1 资产策略与数据模型 | 先统一资产状态，避免每个项目自行解释 |
| 2 | Task 3 Contact 联系闭环决策 | 需要用户真实信息或明确继续站内策略，风险最高但范围小 |
| 3 | Task 2 项目截图与 mock 策略 | 依赖资产模型和截图边界 |
| 4 | Task 4 AI V1 后端前置规格 | 与真实 AI 能力相关，需要单独收敛安全边界 |
| 5 | Task 5 验收与发布护栏 | 最后统一更新 browser 和 release checklist |

## 12. D6 不做事项

| 不做 | 原因 |
|---|---|
| 不引入 CMS | 当前内容规模仍适合 git-based workflow |
| 不改 D3 URL 结构 | 中文根路径和英文 `/en/*` 已完成 SEO 验收 |
| 不新增 `/zh/*` | 避免破坏 canonical 决策 |
| 不伪造联系方式 | 假邮箱和通用社交域名会降低可信度 |
| 不直接做后端表单 | 表单需要反垃圾、隐私、告警和失败处理 |
| 不直接接 AI 模型 | URL 抓取和模型输出需要安全与 schema 设计 |
| 不发布敏感截图 | 资产可信度不能以泄漏隐私或部署细节为代价 |
