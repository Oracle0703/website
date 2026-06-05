# 网站体验与曝光优化 · 调研分析报告

> 评估对象:个人开发者作品集「开发者工作室 / Developer Studio」
> 线上地址:`https://www.meaningful.ink` ｜ 源码:`e:\website\apps\website`（Next.js 14 App Router + TypeScript + Tailwind v4 + MDX，SSG）
> 评估日期:2026-06-04 ｜ 首要视角:**设计 / 体验优先**,曝光 / SEO 为强次重点
> 评估方法:线上真实抓取(curl / openssl,绕过证书)+ 源码静态分析 + 多智能体分维度核查(详见附录 A)

---

## 0. 一句话结论

**这是一套源码质量明显高于线上表现的作品集。** 工程底子、SEO 基建、内容深度都在水准之上;但**线上跑的是一个过期旧版本,且 HTTPS 证书已过期**——访客现在打开站点会先看到浏览器安全警告,核心的「作品 `/projects`」「英文站 `/en`」整页 404,搜索引擎拿不到 `robots.txt` 与 `sitemap.xml`。**在修复部署与证书之前,任何设计与曝光优化都收不到效果。** 部署修复后,设计层最大的短板是「全文字、低对比、卡片同构」缺少视觉锤,以及若干**自相矛盾的历史文案**(如联系页声称"没有表单"却紧跟着一个可用表单)。

---

## 1. 综合评分卡

> 关键洞察:多数维度存在「**线上现状**」与「**源码潜力**」的巨大落差——这本身说明问题主要出在**部署与配置**,而非代码本身。

| 维度 | 线上现状 | 源码潜力 | 说明 |
|---|:---:|:---:|---|
| 生产环境健康度 | ★☆☆☆☆ | — | 证书过期 + 半站 404,属阻断级 |
| 页面曝光 / SEO | ★☆☆☆☆ | ★★★★☆ | 源码基建完整;线上 robots/sitemap/canonical/OG 全坏 |
| 设计与体验 | ★★★☆☆ | ★★★☆☆ | 规范统一但单调、文字过载、缺视觉素材 |
| 内容质量 | ★★★☆☆ | ★★★★☆ | 案例深度好;但历史/计划文案泄漏、信息重复 |
| 可访问性 (A11y) | ★★★☆☆ | ★★★☆☆ | 焦点环/减弱动效/表单标签好;标题层级与 aria 有缺 |
| 性能 | ★★★★☆ | ★★★★☆ | 静态资源不可变缓存 + gzip + SSG,底子好 |
| 工程 / 可维护性 | ★★★☆☆ | ★★★★☆ | 代码整洁;但部署脱节、少量死代码、体验层无测试 |

**最紧急的 5 件事(详见第 9、10 节):**
1. 续期 / 修复 TLS 证书(阻断所有访问)
2. 用当前 `main` 重新构建并部署(找回 `/projects`、`/en`、`/ai-page-analysis`、robots、sitemap)
3. 部署环境设置 `NEXT_PUBLIC_SITE_URL=https://www.meaningful.ink`(修复 OG 图与 canonical)
4. 修正联系页"没有表单"的自相矛盾文案 + 补齐真实社交链接
5. 给作品集补充真实截图 / 缩略图,打破全文字版面

---

## 2. ⚠️ 生产环境严重告警(线上实测 · 阻断级 P0)

> 本节全部为 **2026-06-04 对 `www.meaningful.ink` 的真实抓取结果**,可复现命令见附录 A。这些问题优先级高于一切设计与曝光优化。

### 2.1 HTTPS 证书已过期(★ 最高优先级)
```
notBefore = Feb 13 2026 GMT
notAfter  = May 14 2026 GMT      ← 已过期约 3 周
issuer    = Let's Encrypt R12
```
- 证书是 Let's Encrypt 90 天短证,**未自动续期**。当前所有访客(Chrome/Safari/微信/移动端)打开即遇 `NET::ERR_CERT_DATE_INVALID` 安全警告,绝大多数会立即跳出。
- 连带影响:第三方工具(Google PageSpeed、Search Console 抓取、社交平台抓链、本次环境的 PSI API)都会因证书失败而无法工作。
- **修复:** 立即续期;配置 `certbot`/ACME **自动续期 + 到期告警**,根治复发。

### 2.2 线上运行的是「过期旧版本」,核心页面整页 404
实测各路由 HTTP 状态码:

| 路由 | 状态 | 路由 | 状态 |
|---|:---:|---|:---:|
| `/` 首页 | 200 ✅ | `/projects` **作品集** | **404 ❌** |
| `/blog` | 200 ✅ | `/en` **整个英文站** | **404 ❌** |
| `/about` | 200 ✅ | `/ai-page-analysis` | **404 ❌** |
| `/contact` | 200 ✅ | `/robots.txt` | **404 ❌** |
| `/labs`·`/tracker`·`/enter` | 200 ✅ | `/sitemap.xml` | **404 ❌** |

佐证「旧版本」的硬证据:
- 线上首页导航只有 `首页 / 博客 / 实验室 / 打卡 / 关于 / 联系`,**没有「作品」入口**;首页 HTML 中 `/projects` 链接数 = **0**。
- 线上首页 `<meta name="description">` 为「展示博客、实验室与打卡平台的个人开发者网站」——**只字未提作品 / AI 工具**;而源码当前描述已是「展示 AI 工具、内容系统、后台控制台和产品原型」(`apps/website/lib/i18n.ts:431-432`)。
- 源码里 `/projects`、`/en/*`、`/ai-page-analysis` 的路由目录与导航项**都存在**(`apps/website/lib/i18n.ts:15` 的 `{ href:"/projects", label:"作品" }`、`app/projects/`、`app/en/`)。

> **根因(已核查):** 不是代码缺失,而是**线上部署的构建产物早于这些功能**。一次基于当前 `main` 的正确构建 + 部署即可让上述 404 全部恢复 200。

### 2.3 robots.txt 与 sitemap.xml 对搜索引擎返回 404
- `/robots.txt`、`/sitemap.xml` 实测均返回 HTML 404 页(`<title>404: This page could not be found.</title>`),`sitemap.xml` 中 `<loc>` 条目数 = **0**。
- 后果:搜索引擎**拿不到抓取指令,也拿不到站点地图**,新页面收录会显著变慢、变浅——直接压低「曝光」。
- 源码侧 `app/robots.ts`、`app/sitemap.ts` 完整且 `next.config.js` 未启用 `output:"export"`,因此**只要按 SSR/Node 方式正确部署最新构建,二者会自动恢复**。需排查线上是否误用了「静态导出」或错误的 start 命令。

### 2.4 站点基址被错配为 `localhost`,社交分享图与 canonical 全坏
线上 `/`、`/about` 实测:
```html
<meta property="og:image"   content="http://localhost:3001/og.png">   <!-- 指向本机,分享必坏 -->
<meta property="twitter:image" content="http://localhost:3001/og.png">
<link rel="canonical" href="/">                                       <!-- 相对路径,应为绝对 URL -->
<meta property="og:url" content="/">
```
- 后果:**任何人把链接分享到微信 / X / Slack,预览图都加载失败**(指向 localhost);canonical 用相对路径,削弱收录信号。
- 源码侧 `lib/site-url.ts:1` 的默认值已是 `https://www.meaningful.ink`,`layout.tsx:14` 也设了 `metadataBase`,所有页面经 `toAbsoluteUrl()` 生成**绝对 URL**——**当前源码不可能产出 localhost**。说明旧构建当年是用 `NEXT_PUBLIC_SITE_URL=http://localhost:3001` 打的包。
- **修复:** 部署环境显式设置 `NEXT_PUBLIC_SITE_URL=https://www.meaningful.ink` 再重新构建。

### 2.5 缺少安全响应头 + HTML 不缓存
- 响应头中**没有任何** `Strict-Transport-Security`(HSTS)/`Content-Security-Policy`/`X-Content-Type-Options`/`X-Frame-Options`/`Referrer-Policy`/`Permissions-Policy`。在证书已出问题的背景下,缺 HSTS 尤其值得补。
- 首页 HTML `Cache-Control: private, no-cache, no-store, must-revalidate`——基本等于静态内容**完全不缓存**;而 `_next/static/*` 已是 `public, max-age=31536000, immutable`(✅ 正确)。可为可静态化页面加边缘/HTML 缓存策略。
- ✅ 正面:HTML 已 gzip,首页 ~24KB、主 CSS ~46KB(gzip 后更小),9 个 JS chunk,体量精简,SSR 正常。

---

## 3. 站点概览

- **是什么:** 全栈开发者个人站,集作品案例 / 技术博客 / 交互实验(Labs)/ 打卡系统(Tracker)/ AI 页面分析演示 / 联系表单于一体,主打「从问题定义到原型交付」的产品工程能力。目标是**被看见 → 建立信任 → 产生合作联系**。
- **技术栈:** Next.js 14.2(App Router)· React 18 · TypeScript(strict)· Tailwind v4(CSS 变量主题)· MDX(`next-mdx-remote`)· Framer Motion · Sharp。SSG 为主,`/api/contact`、`/api/analyze` 为动态。
- **页面:** 11 条前台路由(中文)+ `/en/*` 英文镜像;5 个项目案例;13 篇博客 + 系列/TOC/相关文章。
- **渲染:** 全站服务端渲染 + 静态生成(对收录友好),客户端组件负责交互。

---

## 4. 设计与体验(重点)

> 总体:**有完整设计系统、克制而专业,但"安全到单调"**。深浅主题、统一组件类、减弱动效、表单标签等都做得不错;问题集中在**视觉层级缺锤、信息全文字化、以及历史文案/信息重复**。

### 4.1 视觉语言:统一但单调,信息气味弱
- **过度依赖低对比灰文字 + 卡片同构。** 几乎每个版块都是同一套「小标签 kicker → `TITLE_XL` 标题 → `text-muted` 灰色描述 → 等距卡片网格」,首页、enter、作品、tracker 反复使用同一张 `panel-surface card-interactive` 卡片配方(如 `home-page-client.tsx`、`tracker-client.tsx:341/388/532`)。整站缺少焦点、节奏与对比,读者难以一眼抓住重点。
- **设计令牌命名反直觉**(易埋坑):`text-subtle`(#E2E8F0)实际**比** `text-secondary`(#CBD5E1)、`text-muted`(#94A3B8)**更亮**,语义与亮度相反(`app/globals.css:22-25`),后续协作极易误用。
- **对比度:** 深色主题下 muted 正文约 **7.4:1**(达标);**浅色主题**小号 muted 文本约 **4.5:1**,正卡在 WCAG AA 临界线,建议浅色主题下把小字提到 `secondary` 档。
- **一处无效内联样式(死代码):** `home-page-client.tsx:282` 引用了**未定义**的 CSS 变量 `--color-text-secondary`(真实令牌是 `--color-secondary`),该内联颜色不生效。`blog-list-view.tsx:203-208` 也有用内联 style 覆盖颜色、绕过令牌类的同类问题。

### 4.2 信息架构与导航:`/enter` 中转页与业务目标错位
- `/enter` 是一个**全屏、隐藏页眉页脚**的"入口选择"动效页,页眉的「进入」按钮指向它。但它**只暴露 博客 / 实验室 / 打卡 三个入口,恰恰不含「作品」与「联系」**——而这两者才是作品集的转化关键页(`enter-client.tsx`)。结果是:既与主导航功能重叠,又多一次跳转,还把高意向访客往非转化页引流。
- 建议:要么让 `/enter` 覆盖全部主入口(含作品 / 联系),要么弱化它在主路径中的位置,把首屏直接导向「作品」与「联系」。

### 4.3 作品集 `/projects`(组合拳短板最集中)
- **没有任何图像。** 5 个项目里仅 2 个有抽象 SVG mock,3 个是文字版「素材暂缺」卡;**列表卡片完全无缩略图**(`projects-client.tsx:27-77`),整页像一张"文字密度很高的表格"。对**以设计 / 体验为先**的诉求,这是头号短板。
  - 注:`timestamp-tool` 标记为 `live` 却仍无真实截图(`projects.ts:395-397` 注释「D6 尚未截取」)。
  - ✅ 但「素材暂缺」给出了真实原因 + 下一步,属**诚实**做法(`project-detail-client.tsx:122-143`),不要用假图替代,而应补**真截图**。
- **精选项目在「全部项目」中原样重复。** 「全部」网格直接遍历完整数组、未排除 featured,导致 3 张卡**连续出现两次**,看起来像 bug(`projects-client.tsx:113-117` vs `130-134`)。
- **无筛选 / 排序。** 已经有 `status`(concept/prototype/mvp/live)与 5 种 `type` 标签,却没有任何过滤 UI,标签投资被浪费(`projects-client.tsx:101-135`)。
- **详情页是 ~13 个同款面板的长直列**,无页内锚点导航;最有价值的视觉素材(mock 图)排在第 7 位、压在 5 个文字面板之下(`project-detail-client.tsx:255-271`)。
- **内容重复:** 顶层 `problem` 与 `caseStudy.problem` 产生两个「问题」标题;`roadmap` / `nextSteps` / `caseStudy.next` 三处都在讲"未来工作",同一意思被重述 2–3 次。
- **转化 CTA 弱:** 唯一的联系 CTA 在详情页最底部(13 个面板之后),列表页**完全没有**联系入口(`projects-client.tsx:139-152` 只链到首页/博客/实验室)。

### 4.4 博客阅读体验
- ✅ 做得好的:阅读时长真实计算(中日韩字/300 + 英文词/200)、相关文章加权排序、系列上一/下一篇、标签用真实 `?tag=` 链接(可分享、可抓取、无 JS 可用)、封面用 `next/image`。
- **代码块无语法高亮(开发者博客的硬伤)。** MDX 只接了 `remarkGfm`,没有 `rehype-highlight`/`shiki`,代码整段渲染为单色(`mdx-code-block.tsx:50-52`)。对一个满是代码示例的技术博客,长代码块是"一堵同色文字墙"。
- **正文 14px + 行宽过宽。** 正文段落硬编码 `text-sm`(14px)无响应式放大,容器 `max-w-4xl`(~896px)又无内层阅读宽度限制,单行可达 85–100 字符,远超 60–75ch 舒适区(`mdx-components.tsx:183-200`)。
- **博客路由忽略中文覆盖内容(i18n 缺陷)。** 路由调用的是**非本地化**的 `getPostBySlug`/`getPublishedPosts`,而真正会套用 `localizedPostOverrides` 的 `...ForLocale` 变体**从未被调用**(`app/blog/[slug]/page.tsx:69,108`;闲置函数 `lib/blog.ts:419-435`)。结果:中文读者在已写中文译文的文章上仍会看到英文标题/摘要/正文。
- **A11y:** 列表文章标题是裸 `<Link>`、**没有标题元素**(屏读用户按标题浏览时一片空白,`blog-list-view.tsx:190-202`);TOC 无 scroll-spy、`<nav>` 无 `aria-label`;`slugifyHeading` 无去重,**同名标题会产生重复 id**,TOC 锚点会跳错(`lib/blog-headings.ts:21-35`)。

### 4.5 关于 & 联系(转化/信任)
- **联系页文案自相矛盾(P0 转化杀手)。** 「联系路径」版块明确写着"暂未开放公开邮箱或后台表单 / no public inbox and no backend form"(`i18n.ts:732-741`),**紧接着下方就渲染了一个连着 `/api/contact` 的可用表单**(`contact-client.tsx:165-181` → `206-322`)。访客被"请走开、去看作品/博客"劝退,正好发生在表单出现前。这是 **D6 时期的过时计划文案泄漏到了生产**,同时 `D6/D7 form spec`、`contactDecisionTitle/Status` 这类**内部研发黑话不该对访客可见**。
- **关于页几乎不建立信任。** 没有头像、没有姓名、没有量化成果、没有 GitHub/作品/外部链接、连去 `/projects` 或 `/contact` 的 CTA 都没有,整页只有抽象段落 + 3 条原则,唯二链接是"返回入口/首页"(`about-client.tsx:14-51`)。对一个职责就是"建立可信度"的页面,这是结构性缺位。
- ✅ 联系**表单本身**质量高:蜜罐反垃圾 + 服务端限流(3 次/15 分)+ 重复提交拦截 + IP 哈希存储 + 90 天留存说明,隐私姿态透明、可信(`contact-form.ts`、`contact-client.tsx:289-299`)。
- **表单错误体验偏弱:** 所有校验失败合并成底部**单条全局横幅**,不指明哪个字段错;输入框无 `aria-invalid`/`aria-describedby`;必填 vs 选填**无任何视觉/程序标识**(`contact-client.tsx:301-305`、`220/245/258`)。

### 4.6 交互页:Labs / Tracker / AI 演示
- ✅ **AI 页面分析演示是全站最强的交互面**:真实多阶段流水线、进度条、阶段状态、流式日志、结构化结果(评分/问题/重设计/前后对比/交付计划),URL 模式还真连了 `/api/analyze`,并诚实标注"Mock Pipeline / 单页演示"(`ai-page-analysis-landing-client.tsx`)。
  - 但:**生成完成无提示、不滚动到结果**,结果列在移动端堆叠在按钮下方,极易错过"高潮"(无 `aria-live`/`scrollIntoView`,`:1122/1271-1374`);截图/简报两种模式其实**不走后端、输出与 URL 模式几乎一样**,削弱"三种输入"的卖点。
- **Tracker 名为"打卡控制台"实为静态规格图**:整页唯一可交互元素是个**永久禁用**的按钮,数据全是硬编码 mock,无任何点击/打卡/持久化(`tracker-client.tsx:395-401`,页脚自陈"These numbers are mock data")。与关于页宣称的"可运行/可测试原型"不符。
- **Labs 名实不符**:文案是复数"实验与原型的集合",页面却只有一个时间戳工具、无列表/网格/空状态(`labs-client.tsx:16-33`)。
- **跨语言串字:** Tracker 的公告跑马灯在英文站仍显示中文徽标「天机」与中文 aria 标签「修行公告」(`announcement-ticker.tsx:11-21`)。

> **跨页面共性问题:** 内部研发过程语言(`D6/D7`、`mock data`、`TODO`、"尚未截取")反复泄漏到面向访客的文案中,削弱专业感——应统一做一次"生产文案净化"。

### 4.7 响应式 & 动效(整体良好)
- ✅ 移动优先、断点清晰、汉堡菜单、栅格在 `md` 合理重排,触控尺寸友好。
- ✅ 动效克制有品:首屏渐入、滚动揭示(IntersectionObserver)、粒子时钟、跑马灯,且**全部尊重 `prefers-reduced-motion`**。
- 小瑕疵:主题切换无过渡;Tracker 境界表在窄屏靠横向滚动而非重排(`tracker-client.tsx:493-516`)。

---

## 5. 页面曝光 / SEO

### 5.1 源码基建(强,值得肯定)
每页 `generateMetadata`、JSON-LD(WebSite/Person/BlogPosting/SoftwareApplication)、`hreflang`(zh-CN/en/x-default)、`metadataBase` + 绝对 URL、动态 `sitemap.ts`/`robots.ts`、全站 SSG——基础设施在水准之上。

### 5.2 线上曝光当前几乎归零(根因见第 2 节)
证书过期 + robots/sitemap 404 + canonical 相对化 + 半站 404 + OG 图指向 localhost——**搜索引擎与社交平台当前基本无法正常抓取与展示本站**。这是"曝光"的最大失血点,且**全部可由"修证书 + 正确重新部署 + 设对 `NEXT_PUBLIC_SITE_URL`"一次性解决**。

### 5.3 源码级 SEO 缺口(部署修好后仍需补)
- **无 `keywords`:** 任何页面的 metadata 都未设 keywords(博客 frontmatter 有 keywords 概念却没接进 metadata)。
- **无 `BreadcrumbList` 结构化数据:** 全站 0 处 breadcrumb;`/projects/[slug]`、`/blog/[slug]` 错失面包屑富结果。
- **每个项目共用同一张通用 OG 图:** 案例被分享时预览千篇一律(`projects/[slug]/page.tsx:42/47/70`),应做**按项目/文章的动态 OG 图**(`opengraph-image.tsx`)。
- **未设 `og:locale` / `og:locale:alternate`**,双语站社交分享语言信号缺失。
- **sitemap 静态路由项缺 `lastModified`**,且全部条目无 `changeFrequency`/`priority`。
- **`?tag=` 标签页可被索引但无 canonical/noindex**,可能产生大量近重复薄页面(`app/blog/page.tsx`)。

### 5.4 内容策略与度量
- **全站无任何访问分析**(无 GA4 / Plausible / 百度统计 / Microsoft Clarity)。"提高曝光"却没有度量基线——**无法知道流量从哪来、停在哪、是否转化**。这应是修复部署后的第一件事。
- 内容资产扎实(13 篇技术博客 + 5 个深度案例 + 系列),具备持续 SEO 与可信度积累的底子;建议围绕高意向关键词补落地内容,并把博客 tags 接入 keywords。

---

## 6. 性能

- ✅ 底子好:SSG 服务端渲染、`_next/static/*` 不可变长缓存、HTML gzip、payload 精简、`next/image` + 合理 `sizes`、无自定义字体(零字体加载开销)。
- 待办:
  - 真实 Core Web Vitals **待修复证书后用 PageSpeed Insights / Search Console 复测**(本次环境无法访问 Google API,且证书过期会令多数第三方工具失败)。
  - 博客封面**未用 blur 占位**,虽然类型里已有 `blurDataURL` 字段(`blog-cover-image.tsx:22-31`);首屏以下封面会"空白后突现"。
  - 项目 mock 图 `object-cover` 且**无 `sizes`**,可能裁切并多传字节(`project-detail-client.tsx:181-188`,mock/diagram 建议 `object-contain`)。
  - 无 Lighthouse CI / 性能预算;重组件(Framer Motion、粒子画布)可考虑 `next/dynamic` 懒加载。

---

## 7. 工程与可维护性

- ✅ 代码整洁、类型完整、组件可复用(空数据早返回、令牌化排版)。
- **部署与源码脱节**是当前最大工程风险(详见第 2 节)——建议建立"构建即部署"的 CI,杜绝再次跑旧版本。
- 少量**死代码 / 失效样式**:未定义 CSS 变量(4.1)、`/projects` 列表的空状态分支对常量数组永不触发、闲置的本地化博客函数(4.4)。
- **体验层无自动化测试守护**:`apps/website` 内无组件/E2E 测试;仓库根 `tests/` 仅有静态渲染与英文内容审计测试。建议补 Playwright 冒烟(关键路由 200 + 标题 + canonical)与 axe 可访问性检查,正好能在 CI 拦住第 2 节这类"线上 404 / canonical 相对化"回归。

---

## 8. 已确认缺陷清单(可复现)

| # | 缺陷 | 证据 | 影响 |
|---|---|---|---|
| 1 | TLS 证书过期(5/14) | `openssl s_client` notAfter=May 14 2026 | 阻断:全站安全警告 |
| 2 | `/projects`、`/en`、`/ai-page-analysis` 线上 404 | curl 状态码实测 | 阻断:核心页/英文站不可达 |
| 3 | `/robots.txt`、`/sitemap.xml` 线上 404 | curl 实测,`<loc>`=0 | 严重:搜索引擎无法抓取 |
| 4 | OG 图指向 `http://localhost:3001` + canonical 相对 | curl `/`、`/about` 实测 | 严重:社交分享预览坏、收录信号弱 |
| 5 | 联系页文案声称"无表单"却紧跟可用表单 | `i18n.ts:732-741` + `contact-client.tsx:165-181` | 高:直接劝退转化 |
| 6 | 页脚社交链接为占位裸域名 | `site-footer.tsx:8-12` | 高:可信度受损 |
| 7 | 全站无访问分析 | 全仓 grep 无 GA/Plausible/统计 | 高:曝光/转化无度量 |
| 8 | 作品集无图像、列表卡无缩略图 | `projects.ts`(2 mock/3 none)、`projects-client.tsx:27-77` | 高:版面全文字、难扫读 |
| 9 | 博客代码块无语法高亮 | `mdx-code-block.tsx:50-52` | 中:长文可读性差 |
| 10 | 博客路由忽略中文本地化内容 | `app/blog/[slug]/page.tsx:69,108` | 中:中文读者看到英文正文 |
| 11 | 精选项目在"全部"中重复出现 | `projects-client.tsx:113-117/130-134` | 中:疑似 bug 观感 |
| 12 | 关于页无姓名/头像/证明/外链/CTA | `about-client.tsx:14-51` | 中:不建立信任 |
| 13 | 缺少安全响应头(HSTS/CSP 等) | curl 响应头实测 | 中:安全最佳实践缺失 |
| 14 | Tracker 唯一交互按钮永久禁用 | `tracker-client.tsx:395-401` | 中:与"可运行原型"不符 |
| 15 | 内部研发黑话(D6/mock/TODO)泄漏到访客文案 | `i18n.ts`、`projects.ts:395-397` | 中:削弱专业感 |
| 16 | 未定义 CSS 变量导致内联样式失效 | `home-page-client.tsx:282` | 低:死代码 |

---

## 9. 改进方向与优先级路线图

> 优先级排序原则:**先让站点可被访问、可被抓取(P0)→ 再补转化与信任的硬伤(P1)→ 最后做体验打磨与增长(P2)**。
> 成本档:S=数小时 · M=1–2 天 · L=多天。

### P0 · 阻断级(本周必须)
| 项 | 维度 | 影响 | 成本 | 涉及 | 验收标准 |
|---|---|---|:--:|---|---|
| 续期 TLS 证书 + 配置自动续期/告警 | 健康度 | 极高 | S | 服务器/ACME | 浏览器无安全警告;到期前自动续 |
| 用当前 `main` 重新构建并部署 | 健康度/曝光 | 极高 | S–M | CI/部署 | `/projects`、`/en`、`/ai-page-analysis`、robots、sitemap 全部 200 |
| 部署环境设 `NEXT_PUBLIC_SITE_URL=https://www.meaningful.ink` | 曝光 | 极高 | S | 部署 env | OG 图为绝对生产 URL;canonical 绝对化 |
| 修正联系页"无表单"自相矛盾文案 + 清理 D6/D7 黑话 | 转化/内容 | 高 | S | `lib/i18n.ts` | 联系页文案与可用表单一致,无内部术语 |
| 补齐真实社交链接(GitHub/X/LinkedIn 实际主页) | 转化/信任 | 高 | S | `site-footer.tsx` | 点击跳转到本人真实主页 |

### P1 · 高价值(2–4 周)
| 项 | 维度 | 影响 | 成本 | 涉及 | 验收标准 |
|---|---|---|:--:|---|---|
| 接入轻量访问分析(Plausible / GA4 / Clarity) | 度量 | 高 | S | `app/layout.tsx` | 能看到来源/页面/转化漏斗 |
| 作品集补真实截图 + 列表卡缩略图 | 设计 | 高 | M | `projects.ts`、`projects-client.tsx` | 每个项目有视觉素材;列表可视化扫读 |
| "全部项目"排除已精选,消除重复 | 设计 | 中 | S | `projects-client.tsx` | 同卡片不重复出现 |
| 关于页加入姓名/头像/量化成果/外链/CTA | 信任/转化 | 高 | M | `about-client.tsx`、`i18n.ts` | 访客可在 1 屏内判断"他是谁、能做什么、怎么联系" |
| 博客接入语法高亮(`rehype` + 主题) | 体验 | 高 | M | `app/blog/[slug]/page.tsx` | 代码块按语言着色 |
| 博客路由改用 `...ForLocale` 本地化函数 | 内容/i18n | 中 | S | `app/blog/page.tsx`、`[slug]/page.tsx` | 中文读者看到中文正文/标题 |
| 表单错误改为按字段 + `aria-invalid`/必填标识 | A11y/转化 | 中 | M | `contact-client.tsx` | 错误定位到字段;必填可见可读 |
| 提升视觉层级:减少 muted、引入焦点区/真实数据可视化 | 设计 | 中 | M | `globals.css`、各页 | 首屏有明确视觉锤,版块不再千篇一律 |
| 补安全响应头(HSTS/X-Content-Type-Options 等) | 安全 | 中 | S | nginx/Next 头配置 | 安全头扫描通过 |

### P2 · 打磨与增长(持续)
| 项 | 维度 | 成本 | 涉及 |
|---|---|:--:|---|
| 自定义 404 / loading 页(品牌化 + 回流入口) | 体验 | S | `app/not-found.tsx`、`loading.tsx` |
| 动态 OG 图(按文章/项目生成) | 曝光 | M | `opengraph-image.tsx` |
| 补 `BreadcrumbList` + Person/ProfilePage 结构化数据 | 曝光 | S | 详情/关于页 |
| metadata 接入 keywords;sitemap 补 lastmod;`og:locale` | 曝光 | S | 各 `page.tsx`、`sitemap.ts` |
| `?tag=` 标签页加 canonical / 服务端筛选 | 曝光 | M | `app/blog/*` |
| 作品详情页加页内锚点导航 + 提前展示视觉素材 + 合并重复版块 | 体验 | M | `project-detail-client.tsx`、`projects.ts` |
| AI 演示:完成提示 + 滚动到结果 + 按钮 spinner | 体验 | S | `ai-page-analysis-landing-client.tsx` |
| Tracker 做最小可交互(本地乐观打卡)或如实改名"预览" | 内容 | S–M | `tracker-client.tsx` |
| 博客正文字号/行宽优化 + 封面 blur 占位 | 体验/性能 | S | `mdx-components.tsx`、`blog-cover-image.tsx` |
| 设计令牌命名修正(subtle/secondary/muted 亮度对齐语义) | 可维护 | S | `globals.css`、`typography.ts` |
| 补 Playwright 冒烟 + axe 可访问性检查并接入 CI | 工程 | M | `tests/` |

---

## 10. 附录 A:评估方法与证据

**线上实测(2026-06-04,绕过过期证书用 `-k`):**
```bash
# 证书有效期(关键证据)
echo | openssl s_client -connect www.meaningful.ink:443 -servername www.meaningful.ink \
  | openssl x509 -noout -dates        # notAfter=May 14 2026 GMT

# 路由状态码
for p in / /en /projects /blog /about /contact /robots.txt /sitemap.xml; do
  curl -ksS -o /dev/null -w "%{http_code} $p\n" "https://www.meaningful.ink$p"
done                                  # /projects /en /robots.txt /sitemap.xml → 404

# 线上 <head>:og:image=localhost、canonical 相对、描述只提 blog/labs/tracker
curl -ksS https://www.meaningful.ink/ | grep -oE '<meta property="og:image[^>]*>|<link rel="canonical[^>]*>'

# 缓存与安全头
curl -ksS -D - -o /dev/null https://www.meaningful.ink/   # 无 HSTS/CSP;HTML no-store;静态资源 immutable
```

**源码分析:** 通读核心文件(`app/globals.css`、`lib/typography.ts`、`lib/site-url.ts`、`lib/seo.ts`、`app/layout.tsx`、`app/sitemap.ts`/`robots.ts`、`components/site-header.tsx`/`site-footer.tsx`、`components/home/home-page-client.tsx`、`app/enter/enter-client.tsx`)。

**多智能体分维度核查:** 5 个并行子代理分别深读 作品 / 关于+联系 / 交互页 / 博客 / SEO 源码,均要求"文件:行"级证据;并对"线上现状 vs 源码意图"逐条核验,确认本报告第 2 节的线上问题为**部署/配置成因,而非源码缺陷**。

---

## 11. 给客户的一段话

你的站点**代码层面是合格甚至优秀的**——SEO 基建、内容深度、工程规范都在线。当前最痛的不是"设计不够好看",而是**线上跑着一个过期旧版本、且证书已过期**,导致访客进不来、搜索引擎抓不到、分享出去是坏图。**先用半天把"证书 + 重新部署 + 站点基址"三件事做掉,曝光会立刻回到正轨;** 之后再按 P1 补"作品截图、关于页信任、联系页文案、语法高亮"这几处体验硬伤,这套站点的转化与专业观感会有质的提升。
