# 全站优化建议（Remotion Best Practices 视角）

## 0. 范围与结论
- 扫描 `frontend` 下的代码，未发现 Remotion 相关使用（`remotion` / `useCurrentFrame` / `useVideoConfig` / `interpolate` 等）。
- 当前是 Next.js + Tailwind 的常规站点结构，因此 **Remotion 规则不会影响现有页面渲染**。
- 如果未来要引入 Remotion（做视频/动画导出），需要对现有“基于 CSS 过渡的动画写法”进行调整。

---

## 1. Remotion 相关建议（仅当你计划引入 Remotion）
> 根据 remotion-best-practices：动画必须由 `useCurrentFrame()` 驱动，禁止使用 CSS transition / animate 类名。

1. **避免 CSS 过渡/动画**
   - 现有大量 `transition-*` / `hover:*` 类在 Remotion 中不会生效。
   - 如需复用组件到 Remotion，建议创建 Remotion 专用版本：把动画改成 `useCurrentFrame` + `interpolate` 或 `spring`。

2. **动画时间单位统一**
   - Remotion 动画统一使用 `fps` 计算（秒→帧）。
   - 建议建立动画工具层（如 `animate.ts`）封装常见 easing/spring，避免重复手写。

3. **更自然的运动曲线**
   - 建议使用 `spring({ config: { damping: 200 } })` 获得无弹性、干净的过渡。
   - `interpolate` 推荐 `extrapolateLeft/Right: "clamp"` 避免数值越界。

---

## 2. 视觉与一致性优化（站点通用）
> 这些是对当前站点的 UI/UX 统一性建议，不涉及 Remotion。

1. **统一字体体系**
   - 多处页面重复使用 `text-sm text-muted`、`text-xl font-semibold` 等组合。
   - 建议抽出全站统一的 typography tokens（如 `TITLE_H1 / SECTION_TITLE / BODY_SM`）以便统一调整风格。

2. **统一卡片 hover 规则**
   - 首页中 blog/lab/entry cards 有不同 hover 行为。
   - 建议统一为一套：`hover:-translate-y-0.5 + hover:bg-base/70 + hover:border-edge-strong`，提升一致性。

3. **箭头与图标统一**
   - 目前有的地方使用 `common.arrowRight`，有的地方仍是 Unicode `→`。
   - 建议统一为 `common.arrowRight` 或统一 Icon 组件，保证暗色/亮色一致与可控性。

---

## 3. 性能与可访问性建议（可选）
1. **Canvas 动画节流**
   - `ParticleTime` 使用 `requestAnimationFrame` 持续渲染，建议加入“不可见时暂停”（IntersectionObserver）降低资源消耗。

2. **动效尊重用户偏好**
   - 已有 `motion-reduce` 类，但可考虑对 Canvas 动画也加 `prefers-reduced-motion` 的逻辑开关。

3. **交互一致性**
   - CTA、卡片、列表 hover 频率较高，建议统一 focus-visible 样式（键盘导航）来提升无障碍体验。

---

## 4. 小结（可执行优先级建议）
- **P1**：抽 typography tokens（统一字体体系）
- **P2**：统一 hover 交互（卡片/按钮）
- **P3**：统一箭头/图标（去掉 Unicode）
- **P4**：为 Canvas 加可见性节流 / reduced-motion 支持（性能 + 无障碍）
