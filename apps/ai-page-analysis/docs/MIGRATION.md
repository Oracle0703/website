# Migration Notes

## 目标
将 `apps/ai-page-analysis` 从当前工作区迁移成独立仓库，供全公司使用。

## 需要保留的内容
- `app/`
- `components/`
- `lib/`
- `docs/`
- `package.json`
- `tsconfig.json`
- `postcss.config.js`
- `next.config.js`
- `.eslintrc.json`
- `.gitignore`
- `README.md`

## 建议新仓库名
- `ai-page-analysis`
- `page-analysis-assistant`
- `page-redesign-assistant`

## 迁移后的优先事项
1. 跑通本地 dev / build
2. 接入真实分析 API
3. 加入截图上传
4. 支持分享链接
5. 产出部署环境与演示地址

## 当前已具备
- 独立产品目录
- 首页初版
- Mock API
- 产品文档（Plan / Specs）
- 可继续扩展的 demo 数据结构

## 当前未完成
- 稳定的本地运行链路
- 真实模型/服务对接
- 视觉细节精修
- 导出 / 历史记录 / 权限体系
