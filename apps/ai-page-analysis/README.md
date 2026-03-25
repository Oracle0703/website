# AI 页面分析与改版方案助手

独立产品骨架，面向全公司使用。

## 当前状态
- 已有独立项目目录
- 已有 Plan / Specs
- 已有首页初版与 Demo 流程
- 已提供 mock API：`/api/healthz`、`/api/demo`
- 当前仍未接真实分析模型

## 运行
```bash
cd apps/ai-page-analysis
cp .env.example .env.local
npm install
npm run dev -- --hostname 127.0.0.1 --port 3010
```

默认访问：
- http://127.0.0.1:3010

## 当前接口
- `GET /api/healthz`
- `POST /api/demo`
