# AI 页面需求分析助手

一个面向公司内部使用的独立产品原型：给定 URL、截图或 Brief，输出研发可执行的需求解读。

## 当前能力
- 首页作品展示
- 完整 Demo 流程
- 结构化输出：需求类型 / 页面目标 / 产运需求 / 必须实现 / 接口建议 / 关键实现点 / PRD 缺失项 / 研发拆解
- 可直接生成 `plan.md` 与 `spec.md` 草稿块
- 支持复制与导出 `.md` 草稿
- 支持接入真实模型分析接口（无 key 时自动回退 mock）

## 运行
```bash
cd apps/ai-page-analysis
cp .env.example .env.local
npm install
npm run dev -- --hostname 127.0.0.1 --port 3010
```

默认访问：
- http://127.0.0.1:3010

## 环境变量
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3010
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_key
AI_MODEL=gpt-4o
```

## 当前接口
- `GET /api/healthz`
- `POST /api/demo`
- `POST /api/analyze`
