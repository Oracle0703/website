# 网站优化 · 可勾选行动清单

> 配套文档:详细分析见 [WEBSITE_UX_SEO_AUDIT_REPORT.md](./WEBSITE_UX_SEO_AUDIT_REPORT.md)
> 站点:`https://www.meaningful.ink` ｜ 源码:`apps/website` ｜ 生成日期:2026-06-05
> 用法:每项 `- [ ]` 完成后改为 `- [x]`;**🔍 审核位置** 可点击跳转到要改的代码(链接相对本文件 `docs/website/`,在 VSCode 中可直接打开)。
> 图例:成本 **S**=数小时 / **M**=1–2 天 / **L**=多天;⚙️=运维/部署(无源码文件);➕=需新增文件。
> 排序原则:**先让站点可被访问、可被抓取(P0)→ 再补转化与信任硬伤(P1)→ 最后做体验打磨与增长(P2)。**

进度:P0 `2 / 5` ｜ P1 `9 / 9` ｜ P2 `10 / 11` ｜ P3 `14 / 21`
> ✅ **P1 + P0 代码项** 在分支 `fix/website-audit-p1`;**P2 + P3** 在分支 `fix/website-audit-p2`(叠在 p1 上,commits `35a0b03 / ae1744f / 5e5d9d1 / 84ffe14`)。全部经 构建/lint/node 测试(109 过)/Playwright(74 过,含 10 项 axe)验证。
> ⏳ 标注项代码已就绪、待你补素材(统计 ID / 截图 / 社交 URL)即生效;P0 证书/部署/env 由运维处理。
> 未做并附原因:**P2-2 动态 OG**(需捆绑 CJK 字体)· **P3 卡片证据精简**(项目测试要求保留,已回退)· **P3 标题 slug 去重**(需 rehype-slug + slugger 协同改造 TOC)· **P3 演示三模式差异化**(低价值,演示本就标注为 mock)· 个别 N/A-on-main 项(案例项目符号、合并重复——仅存在于 p3b 分支)。

---

## 🔴 P0 · 阻断级(本周必须)

- [ ] **续期 TLS 证书 + 配置自动续期与到期告警**(S · 健康度)
  - 🔍 审核位置:⚙️ 服务器 / ACME(certbot),无源码文件
  - 验收:浏览器打开无安全警告;证书到期前自动续签,并有到期提醒
  - 备注:当前证书 `notAfter=May 14 2026`,已过期;根治"复发"比"手动续一次"更重要

- [ ] **用当前 `main` 重新构建并部署**(S–M · 健康度/曝光)
  - 🔍 审核位置:⚙️ CI / 部署流程(无源码);相关默认值 [lib/site-url.ts:1](../../apps/website/lib/site-url.ts#L1)
  - 验收:`/projects`、`/en`、`/ai-page-analysis`、`/robots.txt`、`/sitemap.xml` 全部返回 **200**
  - 排查:确认线上**不是**「静态导出 `output:export`」或错误的 start 命令,否则 robots/sitemap 仍会 404
  - 自检命令:
    ```bash
    for p in / /en /projects /ai-page-analysis /robots.txt /sitemap.xml; do
      curl -sS -o /dev/null -w "%{http_code} $p\n" "https://www.meaningful.ink$p"
    done   # 期望全部 200
    ```

- [ ] **部署环境设置 `NEXT_PUBLIC_SITE_URL=https://www.meaningful.ink` 后重新构建**(S · 曝光)
  - 🔍 审核位置:⚙️ 部署环境变量;消费处 [app/layout.tsx:11-14](../../apps/website/app/layout.tsx#L11)
  - 验收:线上 `og:image` 为 `https://www.meaningful.ink/og.png`(不再是 localhost);`canonical`/`og:url` 为绝对 URL
  - 自检:`curl -sS https://www.meaningful.ink/ | grep -oE 'og:image[^>]*|canonical[^>]*'`

- [x] **修正联系页"无表单"自相矛盾文案 + 清理 D6/D7 内部黑话**(S · 转化/内容)
  - 🔍 审核位置:[lib/i18n.ts:732-741](../../apps/website/lib/i18n.ts#L732)(及 `contactDecisionTitle/Status`、`formSpecTitle`)
  - 验收:联系页文案与下方可用表单一致,无"暂未开放表单"措辞,无 `D6/D7/mock/TODO` 等研发术语
  - ✅ 本次 PR 已实现(zh+en 文案重写、去黑话)

- [x] **补齐真实社交链接**(S · 转化/信任)
  - 🔍 审核位置:[components/site-footer.tsx:8-12](../../apps/website/components/site-footer.tsx#L8)
  - 验收:GitHub / X / LinkedIn 点击跳转到**本人真实主页**,而非裸域名首页
  - ✅ 页脚已改为读取 [lib/site-links.ts](../../apps/website/lib/site-links.ts)(占位坏链已移除);⏳ 待你在该文件填真实主页 URL,填后页脚与关于页会自动显示

---

## 🟠 P1 · 高价值(2–4 周)

- [x] **接入轻量访问分析**(S · 度量)
  - 🔍 审核位置:[app/layout.tsx](../../apps/website/app/layout.tsx) · 新增 [components/site-analytics.tsx](../../apps/website/components/site-analytics.tsx)
  - 验收:能看到流量来源、页面浏览、联系表单转化漏斗
  - ✅ 代码已实现(env 驱动 `SiteAnalytics`,默认关闭、不锁定厂商);⏳ 待你在部署设 `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`/`NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_CLARITY_ID` 任一

- [x] **作品集补真实截图 + 列表卡缩略图**(M · 设计)
  - 🔍 审核位置:[lib/projects.ts](../../apps/website/lib/projects.ts)(把 `asset.kind:"none"` 换成真截图)· [projects-client.tsx:27-77](../../apps/website/app/projects/projects-client.tsx#L27)
  - 验收:每个项目至少 1 张真实视觉素材;列表网格有缩略图、可快速扫读
  - ✅ 缩略图渲染已实现(有素材即显示,`next/image` 已安全开启 SVG);⏳ 待你补 knock / dashboard-console / timestamp-tool 三个项目的真实截图

- [x] **"全部项目"排除已精选,消除重复**(S · 设计)
  - 🔍 审核位置:[projects-client.tsx:113-134](../../apps/website/app/projects/projects-client.tsx#L113)
  - 验收:同一张卡片不再在"精选"和"全部"中连续重复出现

- [x] **关于页加入姓名 / 头像 / 量化成果 / 外部链接 / CTA**(M · 信任/转化)
  - 🔍 审核位置:[about-client.tsx:14-51](../../apps/website/app/about/about-client.tsx#L14) · 文案 [lib/i18n.ts:685-712](../../apps/website/lib/i18n.ts#L685)
  - 验收:访客可在首屏判断"他是谁、做过什么、怎么联系";页面含去 `/projects` 或 `/contact` 的 CTA
  - ✅ "建立联系"区 + 真实 CTA + 配置驱动外链已实现;⏳ 待你补姓名/头像/量化成果文案 + 在 [lib/site-links.ts](../../apps/website/lib/site-links.ts) 填真实主页 URL

- [x] **博客接入代码语法高亮**(M · 体验)
  - 🔍 审核位置:[app/blog/[slug]/page.tsx:118-126](../../apps/website/app/blog/[slug]/page.tsx#L118)(已用 `rehype-highlight`)· [mdx-code-block.tsx:50-52](../../apps/website/components/mdx-code-block.tsx#L50)
  - 验收:代码块按语言着色,深/浅主题均可读
  - ✅ 服务端高亮 + 主题感知 token 配色已实现(零客户端开销)

- [x] **博客路由改用本地化数据函数 `...ForLocale`**(S · 内容/i18n)
  - 🔍 审核位置:[app/blog/page.tsx:67](../../apps/website/app/blog/page.tsx#L67) · [app/blog/[slug]/page.tsx:69](../../apps/website/app/blog/[slug]/page.tsx#L69) · 闲置函数 [lib/blog.ts:419-435](../../apps/website/lib/blog.ts#L419)
  - 验收:已写中文译文的文章,中文读者看到中文标题/摘要/正文与 TOC
  - ✅ zh 路由已对齐 /en(构建确认 10 篇 zh 文章无一被隐藏)

- [x] **联系表单改为按字段报错 + `aria-invalid` + 必填标识**(M · A11y/转化)
  - 🔍 审核位置:[contact-client.tsx:220-305](../../apps/website/app/contact/contact-client.tsx#L220)
  - 验收:校验错误定位到具体字段;必填/选填有可见标识,屏读可识别
  - ✅ 错误码→字段映射 + `aria-invalid`/`aria-describedby` + 必填(*)/选填标识已实现

- [x] **提升视觉层级:减少 `text-muted`、引入焦点区/真实数据可视化**(M · 设计)
  - 🔍 审核位置:[app/globals.css](../../apps/website/app/globals.css) + 各页客户端组件
  - 验收:首屏有明确视觉锤;版块不再"小标签→标题→灰描述→等距卡片"千篇一律
  - ✅ 保守一版已实现(关键文案 muted→secondary、清死样式);焦点区/数据可视化等更主观打磨建议在浏览器里继续迭代

- [x] **补安全响应头**(S · 安全)
  - 🔍 审核位置:[next.config.js](../../apps/website/next.config.js)(HSTS / X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy)
  - 验收:安全头扫描(如 securityheaders.com)无高危缺失
  - ✅ 已在 next.config 注入(HSTS 短期起步,待证书自动续期确认后调长);若线上由 nginx 兜底,注意勿重复/冲突

---

## 🟡 P2 · 打磨与增长(持续)

- [ ] **自定义 404 / loading 页(品牌化 + 回流入口)**(S · 体验)
  - 🔍 审核位置:➕ 新增 `apps/website/app/not-found.tsx`、`apps/website/app/loading.tsx`
  - 验收:断链落到品牌化页面,提供返回首页/作品/博客入口

- [ ] **动态 OG 图(按文章 / 项目生成)**(M · 曝光)
  - 🔍 审核位置:➕ 新增 `opengraph-image.tsx`(博客与项目详情目录下)
  - 验收:不同文章/项目分享出去预览图各不相同

- [ ] **补 `BreadcrumbList` + Person/ProfilePage 结构化数据**(S · 曝光)
  - 🔍 审核位置:[projects/[slug]/page.tsx](../../apps/website/app/projects/[slug]/page.tsx) · [blog/[slug]/page.tsx](../../apps/website/app/blog/[slug]/page.tsx) · [about/page.tsx](../../apps/website/app/about/page.tsx)
  - 验收:Rich Results 测试识别到面包屑与 Person

- [ ] **metadata 接入 keywords;sitemap 补 lastmod;设 `og:locale`**(S · 曝光)
  - 🔍 审核位置:各 `page.tsx` 的 `generateMetadata` · [app/sitemap.ts:11-13](../../apps/website/app/sitemap.ts#L11)
  - 验收:营销页有 keywords;sitemap 全条目有 lastModified;OG 含 `og:locale`/`alternateLocale`

- [ ] **`?tag=` 标签页加 canonical / 改服务端筛选**(M · 曝光)
  - 🔍 审核位置:[app/blog/blog-client.tsx](../../apps/website/app/blog/blog-client.tsx) · [app/blog/page.tsx](../../apps/website/app/blog/page.tsx)
  - 验收:标签筛选页有指回 `/blog` 的 canonical 或 noindex,不产生近重复薄页面

- [ ] **作品详情页:加页内锚点导航 + 提前展示视觉素材 + 合并重复版块**(M · 体验)
  - 🔍 审核位置:[project-detail-client.tsx:255-271](../../apps/website/app/projects/[slug]/project-detail-client.tsx#L255) · [lib/projects.ts](../../apps/website/lib/projects.ts)
  - 验收:长详情页有 TOC/锚点;mock 图前置;`problem` 与 `caseStudy.problem`、`roadmap/nextSteps/caseStudy.next` 不再重复

- [ ] **AI 演示:生成完成提示 + 滚动到结果 + 按钮 spinner**(S · 体验)
  - 🔍 审核位置:[ai-page-analysis-landing-client.tsx:1122](../../apps/website/components/landing/ai-page-analysis-landing-client.tsx#L1122)(及 `:1210-1217`、`:1271`)
  - 验收:移动端生成完成后有 `aria-live` 提示并自动滚动到结果;按钮有加载态

- [ ] **Tracker 做最小可交互(本地乐观打卡)或如实改名"预览"**(S–M · 内容)
  - 🔍 审核位置:[tracker-client.tsx:395-401](../../apps/website/app/tracker/tracker-client.tsx#L395)
  - 验收:打卡按钮可用并本地更新进度;或文案明确标注为"静态预览"

- [ ] **博客正文字号/行宽优化 + 封面 blur 占位**(S · 体验/性能)
  - 🔍 审核位置:[mdx-components.tsx:183-200](../../apps/website/components/mdx-components.tsx#L183) · [blog-cover-image.tsx:22-31](../../apps/website/components/blog-cover-image.tsx#L22)
  - 验收:正文桌面端字号≥16px、阅读宽度 60–75ch;封面加载有 blur 占位

- [ ] **设计令牌命名修正(subtle / secondary / muted 亮度对齐语义)**(S · 可维护)
  - 🔍 审核位置:[app/globals.css:22-25](../../apps/website/app/globals.css#L22) · [lib/typography.ts](../../apps/website/lib/typography.ts);并清理无效内联样式 [home-page-client.tsx:282](../../apps/website/components/home/home-page-client.tsx#L282)
  - 验收:令牌亮度与命名语义一致;无引用未定义 CSS 变量的死样式

- [ ] **补 Playwright 冒烟 + axe 可访问性检查并接入 CI**(M · 工程)
  - 🔍 审核位置:[tests/](../../tests/) + CI
  - 验收:关键路由 200 + 标题 + canonical 的冒烟用例;axe 无严重项;能拦住"线上 404 / canonical 相对化"回归

---

## 🟢 P3 · 细节长尾(逐条核对,基本为 S 级小修)

> 这些是审计中发现、之前被归并进上面大任务里的"小颗粒"问题,现按页面展开,便于你逐条核对。多为可访问性、文案一致性与版面细节。

### 作品集
- [ ] **列表页与详情页顶部各加一处联系 CTA**(S · 转化)
  - 🔍 审核位置:[projects-client.tsx:139-152](../../apps/website/app/projects/projects-client.tsx#L139) · [project-detail-client.tsx:273-283](../../apps/website/app/projects/[slug]/project-detail-client.tsx#L273)
  - 验收:扫列表/进详情即可一键联系,不必滚到最底部
- [ ] **案例要点列表加项目符号/分隔**(S · 内容)
  - 🔍 审核位置:[project-detail-client.tsx:99-105](../../apps/website/app/projects/[slug]/project-detail-client.tsx#L99)
  - 验收:多句要点不再连成灰字墙,逐条可辨
- [ ] **精简项目卡:移除冗余 evidence 预览**(S · 设计)
  - 🔍 审核位置:[projects-client.tsx:57-66](../../apps/website/app/projects/projects-client.tsx#L57)
  - 验收:卡片信息区收敛,网格更易扫读
- [ ] **mock 图改 `object-contain` + 加 `sizes`**(S · 设计/性能)
  - 🔍 审核位置:[project-detail-client.tsx:181-188](../../apps/website/app/projects/[slug]/project-detail-client.tsx#L181)
  - 验收:素材不被裁切;按视口尺寸出图,不多传字节
- [ ] **校正 timestamp-tool 的 `live` 状态 + 项目链接深链到工具**(S · 内容)
  - 🔍 审核位置:[lib/projects.ts:378](../../apps/website/lib/projects.ts#L378)(链接 :438;knock/dashboard-console `links:[]` 见 :304/:371)
  - 验收:状态与可达成果一致;"打开工具"直达工具而非整页板块
- [ ] **删除作品列表上永不触发的空状态死分支**(S · 工程)
  - 🔍 审核位置:[projects-client.tsx:96](../../apps/website/app/projects/projects-client.tsx#L96)
  - 验收:移除常量数组上的 dead code

### 博客
- [ ] **列表文章标题改用 `<h2/h3>` 标题元素**(S · A11y)
  - 🔍 审核位置:[blog-list-view.tsx:190-202](../../apps/website/app/blog/blog-list-view.tsx#L190)
  - 验收:屏读可按标题浏览文章列表
- [ ] **标题 slug 去重,避免同名标题 id 冲突**(S · A11y/工程)
  - 🔍 审核位置:[lib/blog-headings.ts:21-35](../../apps/website/lib/blog-headings.ts#L21)
  - 验收:同名小节的 TOC 锚点各自跳转正确
- [ ] **TOC 加 scroll-spy + `<nav aria-label>`**(S · A11y/体验)
  - 🔍 审核位置:[blog-detail-client.tsx:111-123](../../apps/website/app/blog/[slug]/blog-detail-client.tsx#L111)
  - 验收:长文有"当前小节"高亮;多个导航地标有名可辨
- [ ] **区分正文标题层级与页面框架标题**(S · A11y)
  - 🔍 审核位置:[blog-detail-client.tsx:110](../../apps/website/app/blog/[slug]/blog-detail-client.tsx#L110) ↔ [mdx-components.tsx:64-88](../../apps/website/components/mdx-components.tsx#L64)
  - 验收:文章内容标题与"目录/相关文章"等框架标题不再同级
- [ ] **内联链接 hover 改用主题色,不强制白字**(S · 设计)
  - 🔍 审核位置:[mdx-components.tsx:138-143](../../apps/website/components/mdx-components.tsx#L138)
  - 验收:浅色主题下正文链接 hover 不再突兀翻白
- [ ] **空筛选状态加"清除筛选"内联入口**(S · 体验)
  - 🔍 审核位置:[blog-list-view.tsx:177-183](../../apps/website/app/blog/blog-list-view.tsx#L177)
  - 验收:无结果时就地可一键复位
- [ ] **列表摘要改用令牌类替代内联 style**(S · 可维护)
  - 🔍 审核位置:[blog-list-view.tsx:203-208](../../apps/website/app/blog/blog-list-view.tsx#L203)
  - 验收:统一走 `TEXT_SM_SECONDARY`,无内联颜色

### 联系表单
- [ ] **提交中 `aria-live` + 成功后移动焦点 + 成功提示分行**(S · A11y)
  - 🔍 审核位置:[contact-client.tsx:307-321](../../apps/website/app/contact/contact-client.tsx#L307)
  - 验收:屏读能感知"提交中/已成功";提交后焦点落到结果,提示可读
- [ ] **去掉"联系路径"版块 kicker==h2 重复;响应预期指引挪到字段旁**(S · 设计/内容)
  - 🔍 审核位置:[contact-client.tsx:166-198](../../apps/website/app/contact/contact-client.tsx#L166)
  - 验收:标题不重复;填写指引贴近对应输入字段

### 交互页(Labs / Tracker / AI 演示)
- [ ] **Labs 文案与"单工具"现状对齐(或加 labs 索引网格)**(S · 内容)
  - 🔍 审核位置:[labs-client.tsx:16-33](../../apps/website/app/labs/labs-client.tsx#L16) · 文案 [i18n.ts:677-678](../../apps/website/lib/i18n.ts#L677)
  - 验收:文案不再"复数承诺"与单一工具不符
- [ ] **公告跑马灯徽标/aria 跟随语言**(S · 内容/i18n)
  - 🔍 审核位置:[announcement-ticker.tsx:11-21](../../apps/website/components/announcement-ticker.tsx#L11) · [tracker-client.tsx:384](../../apps/website/app/tracker/tracker-client.tsx#L384)
  - 验收:英文页不再出现"天机 / 修行公告"中文 chrome
- [ ] **切换输入模式不清空用户已输入内容**(S · 设计)
  - 🔍 审核位置:[ai-page-analysis-landing-client.tsx:962-966](../../apps/website/components/landing/ai-page-analysis-landing-client.tsx#L962)
  - 验收:模式间切换保留已输入文本
- [ ] **截图/简报模式给出可感知差异的输出**(S · 转化)
  - 🔍 审核位置:[ai-page-analysis-landing-client.tsx:1002-1007](../../apps/website/components/landing/ai-page-analysis-landing-client.tsx#L1002)
  - 验收:三种输入产出不再雷同,"三种输入"卖点成立
- [ ] **时间戳工具复制反馈加 `aria-live` + 区分 `aria-label`**(S · A11y)
  - 🔍 审核位置:[timestamp-tool.tsx:323-344](../../apps/website/app/labs/timestamp-tool.tsx#L323)
  - 验收:屏读能听到"已复制"并分清复制的是哪个值
- [ ] **Tracker 境界表窄屏改堆叠而非横向滚动**(S · 设计)
  - 🔍 审核位置:[tracker-client.tsx:493-516](../../apps/website/app/tracker/tracker-client.tsx#L493)
  - 验收:手机端表格重排为堆叠列表,无横向滚动

---

### 完成度速记
- [ ] P0 全部完成(站点可正常访问、可被抓取、分享正常)
- [ ] P1 全部完成(转化与信任硬伤补齐、可度量)
- [ ] P2 全部完成(体验打磨与增长项落地)
- [ ] P3 全部完成(细节长尾清零)

---

> 注:**🔍 审核位置** 的链接相对本文件(`docs/website/`)用 `../../` 指回仓库根再进 `apps/website/…`,在 VSCode 中点击即可打开;`[slug]` 等动态路由路径中的方括号属正常路径,可直接打开。
