# packages workspace

`packages/` 用于沉淀 monorepo 共享能力，推荐仅放以下类型：

- `ui-*`：跨应用复用的 UI 组件
- `config-*`：eslint/tsconfig/postcss 等共享配置
- `utils-*`：无业务耦合的通用工具库

准入规则：

1. 仅放可复用、可版本化的模块。
2. 禁止放运行时产物（例如 `.next/`、`dist/` 的临时调试文件）。
3. 新增 package 必须包含 `package.json` 与最小 README。
