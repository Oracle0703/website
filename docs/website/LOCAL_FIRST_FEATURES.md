# Local-first Website Features

这组功能以“小服务器、低维护成本”为前提：能在构建期完成的工作不放到请求期，能在浏览器完成的工作不新增后端接口。

## 功能与运行边界

| 功能 | 公开入口 | 数据与运行方式 | 服务器成本 |
|---|---|---|---|
| 全站搜索与命令面板 | `/explore`，任意页面 `Ctrl/Cmd + K` | `/search-index.json` 在构建期生成；用户打开搜索后才加载 | 无数据库、无请求期索引 |
| Local-first Tracker | `/tracker` | 习惯和打卡只保存到当前浏览器 `localStorage` | 无账户、无同步服务 |
| Blog engagement | `/blog/[slug]` | 阅读进度、复制、系统分享在浏览器执行；RSS 为静态路由 | 评论未启用时无第三方请求 |
| Resume 与 Now | `/resume`、`/now` | 静态双语页面；简历由浏览器打印或另存为 PDF | 仅静态页面 |
| Developer toolbox | `/labs/tools` | JSON、URL/Base64、UUID、SHA-256、颜色对比度全部在浏览器计算 | 无工具 API |

中文根路径与英文 `/en/*` 路径都提供对应页面。新增入口由 `apps/website/lib/public-routes.mjs` 统一维护，并进入 sitemap 与静态入口验收。

## Tracker 数据与备份

- 存储键和 JSON schema 版本由 `apps/website/lib/tracker-local.ts` 维护。
- 当前限制为最多 20 个习惯、每个名称最多 48 个 Unicode code point、每个习惯最多 730 个日期；导入文件最大 512 KiB。
- 导入前会检查版本、字段、日期、重复 ID、重复名称和容量；失败时不覆盖现有数据。
- 清理浏览器数据、更换浏览器或设备会失去本地记录。发布说明应提醒用户定期导出 JSON。
- 本功能没有云同步。将来若加入账户或同步，必须另行设计认证、加密、冲突合并、导出和删除数据流程。

## 搜索与内容发布

- 搜索索引只包含已发布、对当前语言可见的文章，以及公开页面、项目和工具。
- 索引随 production build 更新；发布或修改文章后需要重新构建站点。
- 命令面板只在首次打开时获取索引，避免增加首屏 JavaScript 之外的网络请求。

## 可选 Giscus 评论

文章阅读进度、分享和 RSS 已默认生效；评论是单篇文章显式开启的可选能力，当前默认关闭。

启用前需要：

1. 在 `Oracle0703/website` 开启 GitHub Discussions，并安装、配置 Giscus。
2. 在**构建环境**提供 `GISCUS_REPO`、`GISCUS_REPO_ID`、`GISCUS_CATEGORY`、`GISCUS_CATEGORY_ID`。这些值会进入生成的客户端页面，不是秘密，不应与私密 token 混用。
3. 在目标文章 frontmatter 中设置 `comments.enabled: true`，再重新构建部署。

只有读者主动点击“加载评论”后，页面才连接 `giscus.app` 并运行第三方脚本。配置不完整时不会注入脚本。允许的第三方脚本与本站页面运行在同一上下文，严格要求 Tracker 数据不被第三方脚本接触时应保持评论关闭；开启前还应确认站点隐私说明、GitHub Discussions 管理规则和所在地区的第三方内容合规要求。

## 内容维护

- Resume 只使用公开项目可证明的能力，不填写无法验证的雇主、学历、客户、年限或成果数字。
- Now 是人工维护的日期快照；内容变化时同步更新 `apps/website/lib/resume-now.ts` 中的日期和条目。
- Developer toolbox 的 SHA-256 是摘要工具，不是密码加密或密码存储方案。

## 发布验收

至少执行：

```bash
npm test
npm run validate:website-content
npm run audit:website-english-content
npm run build:website
npm run verify:website-static
git diff --check
```

涉及页面布局、键盘操作或交互变化时，再执行 `npm run verify:website-browser`，并检查桌面与移动端的中英文页面。
