import type { Locale } from "./i18n-core";
import { siteIdentity } from "./site-identity";

export const shellMessages = {
  zh: {
    nav: {
      brand: siteIdentity.brandName,
      items: [
        { href: "/projects", label: "作品" },
        { href: "/blog", label: "文章" },
        { href: "/explore", label: "探索" },
        { href: "/about", label: "关于" },
        { href: "/contact", label: "联系" }
      ],
      enter: "进入",
      openMenu: "打开菜单",
      closeMenu: "关闭菜单",
      switchToEnglish: "切换到英文",
      switchToChinese: "切换到中文"
    },
    search: {
      label: "搜索",
      open: "打开全站搜索",
      shortcut: "⌘K",
      title: "搜索 Meaningful · Ink",
      description: "查找文章、作品、工具、实验与页面。索引只在打开时加载。",
      placeholder: "输入标题、主题或工具名称…",
      close: "关闭",
      clear: "清空",
      loading: "正在加载静态搜索索引…",
      error: "搜索索引暂时不可用，你仍可以从探索页浏览全部入口。",
      offline: "全站搜索需要联网。离线时可继续使用 Tracker 与开发者工具箱。",
      retry: "重新加载",
      empty: "没有找到匹配内容，试试更短的关键词。",
      resultCount: "找到 {count} 个结果。当前选择：{title}。",
      results: "搜索结果",
      quickLinks: "快捷入口",
      keyboardHint: "↑ ↓ 选择 · Enter 打开 · Esc 关闭",
      kinds: {
        page: "页面",
        article: "文章",
        project: "作品",
        tool: "工具"
      }
    },
    theme: {
      light: "亮色",
      dark: "暗色",
      switchToLight: "切换到亮色",
      switchToDark: "切换到暗色"
    },
    footer: {
      copyright: `© 2026 ${siteIdentity.brandName}`,
      tagline: "AI 产品 · 全栈工程 · 独立创作",
      links: [
        { href: "/resume", label: "简历", localized: true },
        { href: "/now", label: "Now", localized: true },
        { href: "/changelog", label: "更新日志", localized: true },
        { href: "/rss.xml", label: "RSS", localized: false }
      ]
    }
  },
  en: {
    nav: {
      brand: siteIdentity.brandName,
      items: [
        { href: "/projects", label: "Work" },
        { href: "/blog", label: "Writing" },
        { href: "/explore", label: "Explore" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" }
      ],
      enter: "Enter",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      switchToEnglish: "Switch to English",
      switchToChinese: "Switch to Chinese"
    },
    search: {
      label: "Search",
      open: "Open site search",
      shortcut: "⌘K",
      title: "Search Meaningful · Ink",
      description: "Find writing, projects, tools, experiments, and pages. The index loads only when opened.",
      placeholder: "Search by title, topic, or tool…",
      close: "Close",
      clear: "Clear",
      loading: "Loading the static search index…",
      error: "Search is temporarily unavailable. You can still browse every entry from Explore.",
      offline: "Site search needs a connection. Tracker and Developer Tools remain available offline.",
      retry: "Try again",
      empty: "No matching content. Try a shorter term.",
      resultCount: "{count} results. Current selection: {title}.",
      results: "Results",
      quickLinks: "Quick links",
      keyboardHint: "↑ ↓ select · Enter open · Esc close",
      kinds: {
        page: "Page",
        article: "Article",
        project: "Project",
        tool: "Tool"
      }
    },
    theme: {
      light: "Light",
      dark: "Dark",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode"
    },
    footer: {
      copyright: `© 2026 ${siteIdentity.brandName}`,
      tagline: "AI products · Full-stack engineering · Independent making",
      links: [
        { href: "/resume", label: "Resume", localized: true },
        { href: "/now", label: "Now", localized: true },
        { href: "/changelog", label: "Changelog", localized: true },
        { href: "/rss.xml", label: "RSS", localized: false }
      ]
    }
  }
} as const;

export type ShellMessages = (typeof shellMessages)[Locale];

export const getShellMessages = (locale: Locale): ShellMessages => shellMessages[locale];
